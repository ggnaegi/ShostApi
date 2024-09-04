using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shosta.Functions.Migrations
{
    /// <inheritdoc />
    public partial class DeleteCascading : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Concerts_Sessions_SessionId",
                table: "Concerts");

            migrationBuilder.DropForeignKey(
                name: "FK_Musicians_Sessions_SessionId",
                table: "Musicians");

            migrationBuilder.DropForeignKey(
                name: "FK_Soloists_Sessions_SessionId",
                table: "Soloists");

            migrationBuilder.AddForeignKey(
                name: "FK_Concerts_Sessions_SessionId",
                table: "Concerts",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Musicians_Sessions_SessionId",
                table: "Musicians",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Soloists_Sessions_SessionId",
                table: "Soloists",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Concerts_Sessions_SessionId",
                table: "Concerts");

            migrationBuilder.DropForeignKey(
                name: "FK_Musicians_Sessions_SessionId",
                table: "Musicians");

            migrationBuilder.DropForeignKey(
                name: "FK_Soloists_Sessions_SessionId",
                table: "Soloists");

            migrationBuilder.AddForeignKey(
                name: "FK_Concerts_Sessions_SessionId",
                table: "Concerts",
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
    }
}
