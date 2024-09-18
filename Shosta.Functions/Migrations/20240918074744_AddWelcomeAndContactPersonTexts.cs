using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shosta.Functions.Migrations
{
    /// <inheritdoc />
    public partial class AddWelcomeAndContactPersonTexts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactPersonText",
                table: "Organisations",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WelcomeText",
                table: "Organisations",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactPersonText",
                table: "Organisations");

            migrationBuilder.DropColumn(
                name: "WelcomeText",
                table: "Organisations");
        }
    }
}
