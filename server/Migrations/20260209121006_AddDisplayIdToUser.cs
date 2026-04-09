using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CollegeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDisplayIdToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("34568852-979b-4226-8ddd-59a0bf4fadc9"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("4d93ee90-9ce6-4917-8ae4-045ec5549c6a"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("80b91033-e2c8-4929-af7a-ab9603a7d6af"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("864b277c-de5f-4e7d-8845-2e492617c275"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("a4276782-b4fc-4ae7-9151-412c79c68c74"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("e165d6e8-e904-4f7f-a26e-3b01a80e689e"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("09a5f1c2-e4f0-4d67-a602-78791b253d08"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("0bb487c5-84bd-413c-a1ea-9551c1b69340"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("76d94476-0978-4dc8-b821-038ed31e40d7"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("ff977354-2308-4c83-9542-71a0265c0542"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("1bbd4853-1e45-4789-9e0b-d6c9fb925368"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("42c752cc-0191-4c5c-8ae3-f466988480b4"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("dd367421-b280-45d1-9e24-ecd76bff4000"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("dec0d9b7-2cfa-4c4d-825b-f238e7e0d220"));

            migrationBuilder.AddColumn<string>(
                name: "DisplayId",
                table: "Users",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.InsertData(
                table: "Branches",
                columns: new[] { "Id", "NameAr", "NameEn" },
                values: new object[,]
                {
                    { new Guid("47bf6fc3-46a7-4aa8-8151-edcb6ee23ce0"), "نظم المعلومات", "Information Systems" },
                    { new Guid("4c70b44f-f465-4f3a-adb5-b2fd8dfb73db"), "هندسة الشبكات", "Network Engineering" },
                    { new Guid("650447f0-2e5a-4e1e-a2a5-453a1fbb014e"), "الوسائط المتعددة", "Multimedia" },
                    { new Guid("a9df41ef-a639-4393-8b49-ee55fc04ed25"), "هندسة البرمجيات", "Software Engineering" },
                    { new Guid("c1557da8-3b8e-48ba-b19c-ea236bf0f528"), "الأمن السيبراني", "Cyber Security" },
                    { new Guid("e8c9e455-bad5-40e5-9d4c-1ca2523116f5"), "الذكاء الاصطناعي", "Artificial Intelligence" }
                });

            migrationBuilder.InsertData(
                table: "Stages",
                columns: new[] { "Id", "NameAr", "NameEn", "StageNumber" },
                values: new object[,]
                {
                    { new Guid("074d31e0-f046-48a8-b045-33d7f9512b92"), "مرحلة ثانية", "Second Stage", 2 },
                    { new Guid("34288605-c7ee-4634-b59e-b2115169753f"), "مرحلة رابعة", "Fourth Stage", 4 },
                    { new Guid("6256f0b3-5517-4f4a-803d-94d94d307d60"), "مرحلة ثالثة", "Third Stage", 3 },
                    { new Guid("db9c0d73-01ed-4c00-9d06-218a423dccf2"), "مرحلة اولى", "First Stage", 1 }
                });

            migrationBuilder.InsertData(
                table: "StudyTypes",
                columns: new[] { "Id", "NameAr", "NameEn" },
                values: new object[,]
                {
                    { new Guid("21ac269c-d82c-4a4b-904e-8adfd2e505cd"), "جميع الانواع", "All Types" },
                    { new Guid("503b6dbc-235d-4dff-80e3-473ad267baca"), "صباحي", "Morning" },
                    { new Guid("ad911c48-d290-4801-b959-497c66ecec7d"), "مسائي", "Evening" },
                    { new Guid("d58ba200-080e-4327-a969-7b89acd24aec"), "موازي", "Parallel" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_DisplayId",
                table: "Users",
                column: "DisplayId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_DisplayId",
                table: "Users");

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("47bf6fc3-46a7-4aa8-8151-edcb6ee23ce0"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("4c70b44f-f465-4f3a-adb5-b2fd8dfb73db"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("650447f0-2e5a-4e1e-a2a5-453a1fbb014e"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("a9df41ef-a639-4393-8b49-ee55fc04ed25"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("c1557da8-3b8e-48ba-b19c-ea236bf0f528"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("e8c9e455-bad5-40e5-9d4c-1ca2523116f5"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("074d31e0-f046-48a8-b045-33d7f9512b92"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("34288605-c7ee-4634-b59e-b2115169753f"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("6256f0b3-5517-4f4a-803d-94d94d307d60"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("db9c0d73-01ed-4c00-9d06-218a423dccf2"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("21ac269c-d82c-4a4b-904e-8adfd2e505cd"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("503b6dbc-235d-4dff-80e3-473ad267baca"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("ad911c48-d290-4801-b959-497c66ecec7d"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("d58ba200-080e-4327-a969-7b89acd24aec"));

            migrationBuilder.DropColumn(
                name: "DisplayId",
                table: "Users");

            migrationBuilder.InsertData(
                table: "Branches",
                columns: new[] { "Id", "NameAr", "NameEn" },
                values: new object[,]
                {
                    { new Guid("34568852-979b-4226-8ddd-59a0bf4fadc9"), "الوسائط المتعددة", "Multimedia" },
                    { new Guid("4d93ee90-9ce6-4917-8ae4-045ec5549c6a"), "الأمن السيبراني", "Cyber Security" },
                    { new Guid("80b91033-e2c8-4929-af7a-ab9603a7d6af"), "هندسة الشبكات", "Network Engineering" },
                    { new Guid("864b277c-de5f-4e7d-8845-2e492617c275"), "الذكاء الاصطناعي", "Artificial Intelligence" },
                    { new Guid("a4276782-b4fc-4ae7-9151-412c79c68c74"), "نظم المعلومات", "Information Systems" },
                    { new Guid("e165d6e8-e904-4f7f-a26e-3b01a80e689e"), "هندسة البرمجيات", "Software Engineering" }
                });

            migrationBuilder.InsertData(
                table: "Stages",
                columns: new[] { "Id", "NameAr", "NameEn", "StageNumber" },
                values: new object[,]
                {
                    { new Guid("09a5f1c2-e4f0-4d67-a602-78791b253d08"), "مرحلة ثالثة", "Third Stage", 3 },
                    { new Guid("0bb487c5-84bd-413c-a1ea-9551c1b69340"), "مرحلة رابعة", "Fourth Stage", 4 },
                    { new Guid("76d94476-0978-4dc8-b821-038ed31e40d7"), "مرحلة اولى", "First Stage", 1 },
                    { new Guid("ff977354-2308-4c83-9542-71a0265c0542"), "مرحلة ثانية", "Second Stage", 2 }
                });

            migrationBuilder.InsertData(
                table: "StudyTypes",
                columns: new[] { "Id", "NameAr", "NameEn" },
                values: new object[,]
                {
                    { new Guid("1bbd4853-1e45-4789-9e0b-d6c9fb925368"), "مسائي", "Evening" },
                    { new Guid("42c752cc-0191-4c5c-8ae3-f466988480b4"), "جميع الانواع", "All Types" },
                    { new Guid("dd367421-b280-45d1-9e24-ecd76bff4000"), "موازي", "Parallel" },
                    { new Guid("dec0d9b7-2cfa-4c4d-825b-f238e7e0d220"), "صباحي", "Morning" }
                });
        }
    }
}
