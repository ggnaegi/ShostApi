using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shosta.Functions.Migrations
{
    /// <inheritdoc />
    public partial class FinalizeSessionModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConductorSession");

            migrationBuilder.DropTable(
                name: "MusicianSession");

            migrationBuilder.DropTable(
                name: "SessionSoloist");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Soloist",
                table: "Soloist");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Musician",
                table: "Musician");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Conductor",
                table: "Conductor");

            migrationBuilder.RenameTable(
                name: "Soloist",
                newName: "Soloists");

            migrationBuilder.RenameTable(
                name: "Musician",
                newName: "Musicians");

            migrationBuilder.RenameTable(
                name: "Conductor",
                newName: "Conductors");

            migrationBuilder.RenameColumn(
                name: "SessionLogoUrl",
                table: "Sessions",
                newName: "Picture");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Sessions",
                newName: "Teaser");

            migrationBuilder.AddColumn<string>(
                name: "Gallery",
                table: "Sessions",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Presentation",
                table: "Sessions",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Picture",
                table: "Soloists",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SessionId",
                table: "Soloists",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SessionId",
                table: "Musicians",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Picture",
                table: "Conductors",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SessionId",
                table: "Conductors",
                type: "int",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Soloists",
                table: "Soloists",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Musicians",
                table: "Musicians",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Conductors",
                table: "Conductors",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Concerts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Venue = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    City = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Tickets = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    SessionId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Concerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Concerts_Sessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "Sessions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Soloists_SessionId",
                table: "Soloists",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_Musicians_SessionId",
                table: "Musicians",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_Conductors_SessionId",
                table: "Conductors",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_Concerts_SessionId",
                table: "Concerts",
                column: "SessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Conductors_Sessions_SessionId",
                table: "Conductors",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Musicians_Sessions_SessionId",
                table: "Musicians",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Soloists_Sessions_SessionId",
                table: "Soloists",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conductors_Sessions_SessionId",
                table: "Conductors");

            migrationBuilder.DropForeignKey(
                name: "FK_Musicians_Sessions_SessionId",
                table: "Musicians");

            migrationBuilder.DropForeignKey(
                name: "FK_Soloists_Sessions_SessionId",
                table: "Soloists");

            migrationBuilder.DropTable(
                name: "Concerts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Soloists",
                table: "Soloists");

            migrationBuilder.DropIndex(
                name: "IX_Soloists_SessionId",
                table: "Soloists");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Musicians",
                table: "Musicians");

            migrationBuilder.DropIndex(
                name: "IX_Musicians_SessionId",
                table: "Musicians");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Conductors",
                table: "Conductors");

            migrationBuilder.DropIndex(
                name: "IX_Conductors_SessionId",
                table: "Conductors");

            migrationBuilder.DropColumn(
                name: "Gallery",
                table: "Sessions");

            migrationBuilder.DropColumn(
                name: "Presentation",
                table: "Sessions");

            migrationBuilder.DropColumn(
                name: "Picture",
                table: "Soloists");

            migrationBuilder.DropColumn(
                name: "SessionId",
                table: "Soloists");

            migrationBuilder.DropColumn(
                name: "SessionId",
                table: "Musicians");

            migrationBuilder.DropColumn(
                name: "Picture",
                table: "Conductors");

            migrationBuilder.DropColumn(
                name: "SessionId",
                table: "Conductors");

            migrationBuilder.RenameTable(
                name: "Soloists",
                newName: "Soloist");

            migrationBuilder.RenameTable(
                name: "Musicians",
                newName: "Musician");

            migrationBuilder.RenameTable(
                name: "Conductors",
                newName: "Conductor");

            migrationBuilder.RenameColumn(
                name: "Teaser",
                table: "Sessions",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "Picture",
                table: "Sessions",
                newName: "SessionLogoUrl");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Soloist",
                table: "Soloist",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Musician",
                table: "Musician",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Conductor",
                table: "Conductor",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "ConductorSession",
                columns: table => new
                {
                    ConductorsId = table.Column<int>(type: "int", nullable: false),
                    SessionsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConductorSession", x => new { x.ConductorsId, x.SessionsId });
                    table.ForeignKey(
                        name: "FK_ConductorSession_Conductor_ConductorsId",
                        column: x => x.ConductorsId,
                        principalTable: "Conductor",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConductorSession_Sessions_SessionsId",
                        column: x => x.SessionsId,
                        principalTable: "Sessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MusicianSession",
                columns: table => new
                {
                    MusiciansId = table.Column<int>(type: "int", nullable: false),
                    SessionsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MusicianSession", x => new { x.MusiciansId, x.SessionsId });
                    table.ForeignKey(
                        name: "FK_MusicianSession_Musician_MusiciansId",
                        column: x => x.MusiciansId,
                        principalTable: "Musician",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MusicianSession_Sessions_SessionsId",
                        column: x => x.SessionsId,
                        principalTable: "Sessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SessionSoloist",
                columns: table => new
                {
                    SessionsId = table.Column<int>(type: "int", nullable: false),
                    SoloistsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionSoloist", x => new { x.SessionsId, x.SoloistsId });
                    table.ForeignKey(
                        name: "FK_SessionSoloist_Sessions_SessionsId",
                        column: x => x.SessionsId,
                        principalTable: "Sessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SessionSoloist_Soloist_SoloistsId",
                        column: x => x.SoloistsId,
                        principalTable: "Soloist",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConductorSession_SessionsId",
                table: "ConductorSession",
                column: "SessionsId");

            migrationBuilder.CreateIndex(
                name: "IX_MusicianSession_SessionsId",
                table: "MusicianSession",
                column: "SessionsId");

            migrationBuilder.CreateIndex(
                name: "IX_SessionSoloist_SoloistsId",
                table: "SessionSoloist",
                column: "SoloistsId");
        }
    }
}
