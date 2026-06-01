namespace CollegeAPI.Models.DTOs;

public class DashboardStatsDto
{
    public List<ChartDataItem> RoleDistribution { get; set; } = new();
    public List<ChartDataItem> UserTypeDistribution { get; set; } = new();
    public List<ChartDataItem> StudentsByGender { get; set; } = new();
    public List<ChartDataItem> StudentsByStudyType { get; set; } = new();
    public List<ChartDataItem> ContentDistribution { get; set; } = new();
    public List<ChartDataItem> StudentsPerBranch { get; set; } = new();
    public List<ChartDataItem> StudentsPerStage { get; set; } = new();
    public List<ChartDataItem> MaterialsPerBranch { get; set; } = new();
    public List<ChartDataItem> SchedulesPerDay { get; set; } = new();
    public List<ChartDataItem> MonthlyRegistrations { get; set; } = new();
    public List<ChartDataItem> ContentPerMonth { get; set; } = new();
}

public class ChartDataItem
{
    public string Name { get; set; } = string.Empty;
    public string? NameAr { get; set; }
    public int Value { get; set; }
}
