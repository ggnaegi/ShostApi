using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shosta.Functions.Migrations
{
    /// <inheritdoc />
    public partial class AddIsContactPerson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsContactPerson",
                table: "CommitteeMembers",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsContactPerson",
                table: "CommitteeMembers");
        }
    }
}
