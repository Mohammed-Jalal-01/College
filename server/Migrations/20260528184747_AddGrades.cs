using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CollegeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddGrades : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateTable(
                name: "Grades",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SubjectName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: false),
                    StudyTypeId = table.Column<Guid>(type: "uuid", nullable: false),
                    StageId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FileType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    OriginalFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    UploadedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Grades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Grades_Branches_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Grades_Stages_StageId",
                        column: x => x.StageId,
                        principalTable: "Stages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Grades_StudyTypes_StudyTypeId",
                        column: x => x.StudyTypeId,
                        principalTable: "StudyTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Grades_Users_UploadedBy",
                        column: x => x.UploadedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Branches",
                columns: new[] { "Id", "NameAr", "NameEn" },
                values: new object[,]
                {
                    { new Guid("0f47b438-cc66-4aa4-ab79-ec534df11921"), "الذكاء الاصطناعي", "Artificial Intelligence" },
                    { new Guid("2c17a737-a3a2-4f35-96f3-6f2c1534f31a"), "نظم المعلومات", "Information Systems" },
                    { new Guid("37c30d74-0cbc-401c-8fbd-ac4fa329cd50"), "الوسائط المتعددة", "Multimedia" },
                    { new Guid("60881c59-bbad-479e-9fdc-28f9e9edf24c"), "هندسة البرمجيات", "Software Engineering" },
                    { new Guid("bbfdc1d0-4e9c-4c85-ad06-0e3d767bffbb"), "الأمن السيبراني", "Cyber Security" },
                    { new Guid("f38e041c-bb59-418f-a664-f6914e207362"), "هندسة الشبكات", "Network Engineering" }
                });

            migrationBuilder.InsertData(
                table: "Stages",
                columns: new[] { "Id", "NameAr", "NameEn", "StageNumber" },
                values: new object[,]
                {
                    { new Guid("24d31b7d-d98f-498c-b8b6-d7219c25ff6a"), "مرحلة رابعة", "Fourth Stage", 4 },
                    { new Guid("6213680a-4347-4078-9e02-f421623ace27"), "مرحلة ثالثة", "Third Stage", 3 },
                    { new Guid("d50aff0c-aea7-4bfb-a769-c0ef8f3ccde2"), "مرحلة ثانية", "Second Stage", 2 },
                    { new Guid("dffa962c-d096-4500-986d-931065d266c4"), "مرحلة اولى", "First Stage", 1 }
                });

            migrationBuilder.InsertData(
                table: "StudyTypes",
                columns: new[] { "Id", "NameAr", "NameEn" },
                values: new object[,]
                {
                    { new Guid("2e637a2f-1599-472f-afa3-777e481aa183"), "جميع الانواع", "All Types" },
                    { new Guid("4ea2d377-bc91-41e3-864f-4d2f87579c54"), "موازي", "Parallel" },
                    { new Guid("c48a809b-9f83-4982-ad7e-abdc3ad4ba84"), "صباحي", "Morning" },
                    { new Guid("de3247ee-01f0-485d-9b06-cfd5b8226bdd"), "مسائي", "Evening" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Grades_BranchId",
                table: "Grades",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_Grades_StageId",
                table: "Grades",
                column: "StageId");

            migrationBuilder.CreateIndex(
                name: "IX_Grades_StudyTypeId",
                table: "Grades",
                column: "StudyTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Grades_UploadedBy",
                table: "Grades",
                column: "UploadedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Grades");

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("0f47b438-cc66-4aa4-ab79-ec534df11921"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("2c17a737-a3a2-4f35-96f3-6f2c1534f31a"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("37c30d74-0cbc-401c-8fbd-ac4fa329cd50"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("60881c59-bbad-479e-9fdc-28f9e9edf24c"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("bbfdc1d0-4e9c-4c85-ad06-0e3d767bffbb"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("f38e041c-bb59-418f-a664-f6914e207362"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("24d31b7d-d98f-498c-b8b6-d7219c25ff6a"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("6213680a-4347-4078-9e02-f421623ace27"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("d50aff0c-aea7-4bfb-a769-c0ef8f3ccde2"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("dffa962c-d096-4500-986d-931065d266c4"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("2e637a2f-1599-472f-afa3-777e481aa183"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("4ea2d377-bc91-41e3-864f-4d2f87579c54"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("c48a809b-9f83-4982-ad7e-abdc3ad4ba84"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("de3247ee-01f0-485d-9b06-cfd5b8226bdd"));

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
        }
    }
}
