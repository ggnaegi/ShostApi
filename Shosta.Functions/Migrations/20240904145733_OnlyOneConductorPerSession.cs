using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shosta.Functions.Migrations
{
    /// <inheritdoc />
    public partial class OnlyOneConductorPerSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conductors_Sessions_SessionId",
                table: "Conductors");

            migrationBuilder.DropIndex(
                name: "IX_Conductors_SessionId",
                table: "Conductors");

            migrationBuilder.AddColumn<int>(
                name: "ConductorId",
                table: "Sessions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "SessionId",
                table: "Conductors",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Conductors_SessionId",
                table: "Conductors",
                column: "SessionId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Conductors_Sessions_SessionId",
                table: "Conductors",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conductors_Sessions_SessionId",
                table: "Conductors");

            migrationBuilder.DropIndex(
                name: "IX_Conductors_SessionId",
                table: "Conductors");

            migrationBuilder.DropColumn(
                name: "ConductorId",
                table: "Sessions");

            migrationBuilder.AlterColumn<int>(
                name: "SessionId",
                table: "Conductors",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_Conductors_SessionId",
                table: "Conductors",
                column: "SessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Conductors_Sessions_SessionId",
                table: "Conductors",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id");
        }
    }
}
