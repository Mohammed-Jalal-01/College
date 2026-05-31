using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CollegeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlAndAboutCollegeCreatedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "News",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Activities",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "AboutCollege",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "AboutCollege",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.InsertData(
                table: "Branches",
                columns: new[] { "Id", "NameAr", "NameEn" },
                values: new object[,]
                {
                    { new Guid("861de7bd-ddbb-4a90-b7bd-63082abc48f9"), "الذكاء الاصطناعي", "Artificial Intelligence" },
                    { new Guid("8a1d930f-54b9-4c41-a15d-3d7fe6a8f11b"), "الوسائط المتعددة", "Multimedia" },
                    { new Guid("c28ec381-1ef9-40b9-9fda-ea75dc999d55"), "هندسة الشبكات", "Network Engineering" },
                    { new Guid("dc7f3efd-3c8e-46b6-83a6-5d5a7e51d723"), "الأمن السيبراني", "Cyber Security" },
                    { new Guid("e042e23d-6224-445c-ba7a-8ff90ba52733"), "نظم المعلومات", "Information Systems" },
                    { new Guid("e53913a9-ef40-470c-bc14-0996689ff3cf"), "هندسة البرمجيات", "Software Engineering" }
                });

            migrationBuilder.InsertData(
                table: "Stages",
                columns: new[] { "Id", "NameAr", "NameEn", "StageNumber" },
                values: new object[,]
                {
                    { new Guid("0a303fb5-7a57-4730-b0cd-782c1c95d297"), "مرحلة ثالثة", "Third Stage", 3 },
                    { new Guid("1f115794-6f2c-423e-9983-272169b7a34f"), "مرحلة اولى", "First Stage", 1 },
                    { new Guid("c039cfab-4695-4514-ac3c-14b04e1eb5d5"), "مرحلة ثانية", "Second Stage", 2 },
                    { new Guid("e674e3d0-00ed-4407-a190-f6594dab9dd3"), "مرحلة رابعة", "Fourth Stage", 4 }
                });

            migrationBuilder.InsertData(
                table: "StudyTypes",
                columns: new[] { "Id", "NameAr", "NameEn" },
                values: new object[,]
                {
                    { new Guid("6282cba1-f330-46b8-9e1e-7c9b2f4c5ca3"), "صباحي", "Morning" },
                    { new Guid("ddaa8a6c-1e73-499e-b1a0-331d096f6372"), "موازي", "Parallel" },
                    { new Guid("eeb250e3-1d7c-42eb-94e0-9e66f785c436"), "جميع الانواع", "All Types" },
                    { new Guid("f13bf679-d3c9-4e38-858f-51156b66e275"), "مسائي", "Evening" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("861de7bd-ddbb-4a90-b7bd-63082abc48f9"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("8a1d930f-54b9-4c41-a15d-3d7fe6a8f11b"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("c28ec381-1ef9-40b9-9fda-ea75dc999d55"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("dc7f3efd-3c8e-46b6-83a6-5d5a7e51d723"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("e042e23d-6224-445c-ba7a-8ff90ba52733"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("e53913a9-ef40-470c-bc14-0996689ff3cf"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("0a303fb5-7a57-4730-b0cd-782c1c95d297"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("1f115794-6f2c-423e-9983-272169b7a34f"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("c039cfab-4695-4514-ac3c-14b04e1eb5d5"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("e674e3d0-00ed-4407-a190-f6594dab9dd3"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("6282cba1-f330-46b8-9e1e-7c9b2f4c5ca3"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("ddaa8a6c-1e73-499e-b1a0-331d096f6372"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("eeb250e3-1d7c-42eb-94e0-9e66f785c436"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("f13bf679-d3c9-4e38-858f-51156b66e275"));

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "News");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "AboutCollege");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "AboutCollege");

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
        }
    }
}
