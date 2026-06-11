using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CollegeAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDepartmentDescriptionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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
                name: "DescriptionAr",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "DescriptionEn",
                table: "Departments");

            migrationBuilder.InsertData(
                table: "Branches",
                columns: new[] { "Id", "NameAr", "NameEn" },
                values: new object[,]
                {
                    { new Guid("3dd5318c-78f9-407b-ae02-2d17670740d2"), "الذكاء الاصطناعي", "Artificial Intelligence" },
                    { new Guid("768906fa-13c7-455c-8cdf-eeb9c43047cc"), "نظم المعلومات", "Information Systems" },
                    { new Guid("8d38e498-9a85-4be1-8a8d-4440402b918b"), "هندسة الشبكات", "Network Engineering" },
                    { new Guid("ae1e2c9d-88f9-4217-9c4a-c1abd479e88e"), "الأمن السيبراني", "Cyber Security" },
                    { new Guid("ca4c3f51-4b60-4c1d-a34f-24921e81ee6e"), "هندسة البرمجيات", "Software Engineering" },
                    { new Guid("e2d38afb-66e6-40db-a409-f687aa34ca87"), "الوسائط المتعددة", "Multimedia" }
                });

            migrationBuilder.InsertData(
                table: "Stages",
                columns: new[] { "Id", "NameAr", "NameEn", "StageNumber" },
                values: new object[,]
                {
                    { new Guid("20540370-babc-48b3-bab2-23193d6694da"), "مرحلة ثالثة", "Third Stage", 3 },
                    { new Guid("363020b9-bbbb-4dff-957d-df338e47659d"), "مرحلة ثانية", "Second Stage", 2 },
                    { new Guid("cd57c38a-77bd-4c9e-8dad-d9313744b924"), "مرحلة رابعة", "Fourth Stage", 4 },
                    { new Guid("de39baf0-b250-41ec-8ab0-115d0f57ae2a"), "مرحلة اولى", "First Stage", 1 }
                });

            migrationBuilder.InsertData(
                table: "StudyTypes",
                columns: new[] { "Id", "NameAr", "NameEn" },
                values: new object[,]
                {
                    { new Guid("5593fee1-5208-4997-b82b-3600f29ab611"), "صباحي", "Morning" },
                    { new Guid("85cf43fa-3d01-432f-9519-ac33ba6f4939"), "مسائي", "Evening" },
                    { new Guid("cbe76733-b4ef-4a75-89cd-1e258cad313d"), "جميع الانواع", "All Types" },
                    { new Guid("e252fd78-871d-4b22-92ba-5672f72468b1"), "موازي", "Parallel" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("3dd5318c-78f9-407b-ae02-2d17670740d2"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("768906fa-13c7-455c-8cdf-eeb9c43047cc"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("8d38e498-9a85-4be1-8a8d-4440402b918b"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("ae1e2c9d-88f9-4217-9c4a-c1abd479e88e"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("ca4c3f51-4b60-4c1d-a34f-24921e81ee6e"));

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("e2d38afb-66e6-40db-a409-f687aa34ca87"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("20540370-babc-48b3-bab2-23193d6694da"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("363020b9-bbbb-4dff-957d-df338e47659d"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("cd57c38a-77bd-4c9e-8dad-d9313744b924"));

            migrationBuilder.DeleteData(
                table: "Stages",
                keyColumn: "Id",
                keyValue: new Guid("de39baf0-b250-41ec-8ab0-115d0f57ae2a"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("5593fee1-5208-4997-b82b-3600f29ab611"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("85cf43fa-3d01-432f-9519-ac33ba6f4939"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("cbe76733-b4ef-4a75-89cd-1e258cad313d"));

            migrationBuilder.DeleteData(
                table: "StudyTypes",
                keyColumn: "Id",
                keyValue: new Guid("e252fd78-871d-4b22-92ba-5672f72468b1"));

            migrationBuilder.AddColumn<string>(
                name: "DescriptionAr",
                table: "Departments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DescriptionEn",
                table: "Departments",
                type: "text",
                nullable: false,
                defaultValue: "");

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
    }
}
