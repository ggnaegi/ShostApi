using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using SendGrid;
using SendGrid.Helpers.Mail;
using Shosta.Functions.Domain.SendMail;

namespace Shosta.Functions.API;

public class SendMail(IConfiguration configuration, ISendGridClient sendGridClient, ILoggerFactory loggerFactory, IHttpClientFactory httpClientFactory)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<Organisations>();
    [Function(nameof(SendContactMail))]
    public async Task<IActionResult> SendContactMail(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "contact-mail")] 
        HttpRequestData req,
        FunctionContext executionContext)
    {
        var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        var data = JsonConvert.DeserializeObject<EmailData>(requestBody);
        
        // verify that the request body is not empty and that the required fields are not empty
        if(data == null || string.IsNullOrEmpty(data.Email) || string.IsNullOrEmpty(data.Message) || string.IsNullOrEmpty(data.RecaptchaResponse))
        {
            _logger.LogError("Invalid email data: {emailData}", requestBody);
            return new BadRequestObjectResult("Invalid email data.");
        }
        
        // Verify destination email before starting the process
        var destEmail = configuration.GetValue<string>("DestEmail");
        if(string.IsNullOrEmpty(destEmail))
        {
            _logger.LogError("Destination email is missing.");
            throw new Exception("Destination email is missing.");
        }

        // Verify reCAPTCHA
        var secretKey = configuration.GetValue<string>("RecaptchaSecretKey");
        if(string.IsNullOrEmpty(secretKey))
        {
            _logger.LogError("Recaptcha secret key is missing.");
            // we only throw an exception here, we don't want to expose too much information to the client
            throw new Exception("Recaptcha secret key is missing.");
        }
        
        var verified = await VerifyRecaptcha(secretKey, data.RecaptchaResponse);
        if (!verified)
        {
            _logger.LogError("Recaptcha verification failed.");
            return new BadRequestObjectResult("Recaptcha verification failed.");
        }

        // Send Email with SendGrid
        var sent = await Send(destEmail, data);
        return sent ? new OkObjectResult("Email sent successfully.") : new BadRequestObjectResult("Failed to send email.");
    }

    /// <summary>
    /// Sending an email using SendGrid
    /// </summary>
    /// <param name="destEmail"></param>
    /// <param name="data"></param>
    /// <returns></returns>
    private async Task<bool> Send(string destEmail, EmailData data)
    {
        var message = new SendGridMessage();
        message.AddTo(destEmail);
        message.SetSubject("Message du formulaire de contact SHOSTA");
        message.SetFrom(new EmailAddress("formulaire@shosta.ch", "Postmaster SHOSTA"));
        message.AddContent("text/plain", $"Nom: {data.FirstName} {data.LastName}\nEmail: {data.Email}\nTéléphone: {data.Phone}\nMessage: {data.Message}");
        
        var response = await sendGridClient.SendEmailAsync(message);
        return response.IsSuccessStatusCode;
    }

    /// <summary>
    /// Verify the reCAPTCHA token
    /// </summary>
    /// <param name="secretKey"></param>
    /// <param name="recaptchaResponse"></param>
    /// <returns></returns>
    private async Task<bool> VerifyRecaptcha(string secretKey, string recaptchaResponse)
    {
        var httpClient = httpClientFactory.CreateClient();
        
        var response = await httpClient.PostAsync($"https://www.google.com/recaptcha/api/siteverify?secret={secretKey}&response={recaptchaResponse}", null);
        var content = await response.Content.ReadAsStringAsync();
        var verification = JsonConvert.DeserializeObject<RecaptchaResponse>(content);
        
        return verification is { Success: true };
    }
}