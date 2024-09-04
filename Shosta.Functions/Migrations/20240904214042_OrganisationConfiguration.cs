using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shosta.Functions.Migrations
{
    /// <inheritdoc />
    public partial class OrganisationConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CommitteeMembers_Organisations_OrganisationId",
                table: "CommitteeMembers");

            migrationBuilder.CreateTable(
                name: "Sponsor",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Picture = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    OrganisationId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sponsor", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sponsor_Organisations_OrganisationId",
                        column: x => x.OrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Organisations_Year",
                table: "Organisations",
                column: "Year",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sponsor_OrganisationId",
                table: "Sponsor",
                column: "OrganisationId");

            migrationBuilder.AddForeignKey(
                name: "FK_CommitteeMembers_Organisations_OrganisationId",
                table: "CommitteeMembers",
                column: "OrganisationId",
                principalTable: "Organisations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CommitteeMembers_Organisations_OrganisationId",
                table: "CommitteeMembers");

            migrationBuilder.DropTable(
                name: "Sponsor");

            migrationBuilder.DropIndex(
                name: "IX_Organisations_Year",
                table: "Organisations");

            migrationBuilder.AddForeignKey(
                name: "FK_CommitteeMembers_Organisations_OrganisationId",
                table: "CommitteeMembers",
                column: "OrganisationId",
                principalTable: "Organisations",
                principalColumn: "Id");
        }
    }
}
