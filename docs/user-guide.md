# Education Leadership Analytics Dashboard - User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Summary Statistics Cards](#summary-statistics-cards)
4. [Enrollment Chart](#enrollment-chart)
5. [Graduation Rate Trends](#graduation-rate-trends)
6. [Budget Allocation Chart](#budget-allocation-chart)
7. [Department Rankings Table](#department-rankings-table)
8. [Navigation and Sidebar](#navigation-and-sidebar)
9. [Metric Definitions](#metric-definitions)
10. [Frequently Asked Questions](#frequently-asked-questions)

---

## Getting Started

### System Requirements

The Education Leadership Analytics Dashboard runs in any modern web browser. No additional software installation is required.

- **Recommended browsers**: Chrome 90+, Firefox 88+, Safari 14+, Microsoft Edge 90+
- **Screen resolution**: Minimum 1024x768; optimized for 1440x900 and above
- **Internet connection**: Required for loading the Chart.js visualization library from CDN

### Opening the Dashboard

1. Navigate to the project folder on your file system
2. Double-click `index.html` to open it in your default browser
3. Alternatively, right-click `index.html` and select "Open with" to choose a specific browser
4. The dashboard will load immediately with all visualizations rendered

### First-Time Orientation

When you first open the dashboard, you will see:
- A dark sidebar on the left with navigation options
- A top bar displaying the dashboard title and current academic year
- Four summary statistic cards at the top of the main content area
- Interactive charts in the center section
- A department rankings table at the bottom

---

## Dashboard Overview

The dashboard is organized into distinct sections, each designed to provide educational leaders with specific types of institutional insight. The layout follows a top-down information hierarchy, starting with high-level summary metrics and drilling down into more detailed analyses.

### Layout Structure

The dashboard uses a two-column layout:
- **Left sidebar (260px)**: Contains navigation links organized into three sections (Main, Analytics, Administration)
- **Main content area**: Contains all data visualizations and metrics

The interface is fully responsive. On screens narrower than 1200px, charts stack into a single column. On screens narrower than 768px, the sidebar is hidden to maximize content space.

---

## Summary Statistics Cards

The four cards at the top of the dashboard provide at-a-glance metrics for the most critical institutional indicators.

### Total Students (12,450)

This figure represents the total headcount of currently enrolled students across all programs, including full-time, part-time, and online learners. The percentage change (4.2%) indicates year-over-year enrollment growth compared to the same period in the previous academic year.

### Graduation Rate (87.3%)

The institutional graduation rate is calculated as the percentage of first-time, full-time degree-seeking students who complete their program within 150% of the normal completion time (six years for a four-year program). The 2.1% increase indicates sustained improvement in student success initiatives.

### Faculty Count (892)

This includes all full-time and tenure-track faculty members across all departments. Adjunct and part-time instructors are not included in this count. The "+18 new hires" notation reflects net additions during the current academic year.

### Average GPA (3.24)

The institution-wide average GPA is computed from all graded coursework across all enrolled students during the current academic year. This metric uses a 4.0 scale and includes both undergraduate and graduate programs. The 0.08 improvement suggests positive trends in academic performance.

---

## Enrollment Chart

### Chart Type
Vertical bar chart

### Description
The Enrollment by Department chart displays the number of currently enrolled students in each major academic department. Each bar is color-coded for easy identification and comparison.

### Departments Displayed
- **Engineering**: 2,650 students
- **Business**: 2,380 students
- **Computer Science**: 2,840 students
- **Health Sciences**: 1,950 students
- **Sciences**: 1,680 students
- **Arts & Humanities**: 1,420 students
- **Education**: 1,130 students

### Interacting with the Chart
- **Hover**: Move your mouse over any bar to see the exact enrollment number in a tooltip
- **Comparison**: Visual bar heights allow quick comparison between departments
- **Color coding**: Each department has a unique color consistent with other dashboard references

### Interpreting the Data
The enrollment distribution reveals which programs are driving institutional growth. Computer Science leads enrollment, which aligns with national trends in technology education demand. Engineering and Business follow closely, representing traditional high-demand programs. Education and Arts & Humanities show lower enrollment, which may warrant targeted recruitment strategies.

---

## Graduation Rate Trends

### Chart Type
Multi-line chart with filled areas

### Description
This chart tracks graduation rates over a five-year period (2021-2025) with three distinct trend lines representing different academic groupings.

### Trend Lines
- **Overall (Blue)**: The institution-wide graduation rate across all programs
- **STEM (Green)**: Graduation rate for Science, Technology, Engineering, and Mathematics programs
- **Humanities (Yellow)**: Graduation rate for Arts, Humanities, and Social Sciences programs

### Five-Year Data Points

| Year | Overall | STEM  | Humanities |
|------|---------|-------|------------|
| 2021 | 81.2%   | 83.5% | 78.9%      |
| 2022 | 83.1%   | 85.2% | 80.3%      |
| 2023 | 84.8%   | 87.0% | 82.1%      |
| 2024 | 86.0%   | 88.8% | 83.5%      |
| 2025 | 87.3%   | 90.2% | 84.9%      |

### Interacting with the Chart
- **Hover**: Move your mouse over any data point to see the exact percentage for that year and category
- **Legend toggle**: Click on a legend item (Overall, STEM, or Humanities) to show or hide that trend line
- **Trend analysis**: The smooth curve connecting data points helps identify acceleration or deceleration in rates

### Interpreting the Data
All three categories show consistent upward trends, indicating successful institutional efforts in student retention and degree completion. STEM programs consistently outperform the institutional average, while Humanities programs are closing the gap, improving by 6 percentage points over the five-year period.

---

## Budget Allocation Chart

### Chart Type
Doughnut chart with center cutout

### Description
The Budget Allocation chart shows how the institution's total operating budget ($284M) is distributed across major functional categories.

### Budget Categories
- **Instruction (35%)**: $99.4M - Direct costs of teaching, including faculty salaries, classroom supplies, and instructional technology
- **Research (22%)**: $62.5M - Funded research initiatives, lab equipment, research staff, and grant matching
- **Student Services (15%)**: $42.6M - Advising, counseling, career services, student organizations, and wellness programs
- **Administration (12%)**: $34.1M - Executive leadership, legal, finance, human resources, and institutional governance
- **Facilities (9%)**: $25.6M - Building maintenance, utilities, campus safety, and capital improvements
- **Technology (7%)**: $19.9M - IT infrastructure, network services, learning management systems, and cybersecurity

### Interacting with the Chart
- **Hover**: Move your mouse over any segment to see the percentage and corresponding dollar amount
- **Segment highlight**: Segments expand slightly on hover to visually emphasize the selected category
- **Legend**: Color-coded labels below the chart identify each budget category

---

## Department Rankings Table

### Description
The Top Performing Departments table ranks academic departments by a composite performance score derived from multiple metrics.

### Columns
- **Rank**: Numerical ranking displayed in a circular badge
- **Department**: Name of the academic department
- **Students**: Total enrollment in that department
- **Graduation Rate**: Percentage of students completing their degree within the standard timeframe
- **Avg GPA**: Average grade point average for students in the department
- **Satisfaction**: Student satisfaction score from course evaluations (out of 5.0)
- **Rating**: Categorical assessment based on the composite score

### Rating Categories
- **Excellent** (Green badge): Composite score in the top tier, indicating exceptional performance across all metrics
- **Good** (Blue badge): Above-average performance with strong metrics in most categories
- **Average** (Yellow badge): Performance meeting institutional benchmarks with room for improvement

### Interpreting the Table
Department rankings help leadership identify both exemplary programs to model and programs that may need additional resources or intervention. The table supports strategic resource allocation decisions and helps prioritize departmental review cycles.

---

## Navigation and Sidebar

The sidebar provides access to different sections of the dashboard platform:

### Main Section
- **Dashboard**: The primary overview page (current view)
- **Enrollment**: Detailed enrollment analytics with demographic breakdowns
- **Performance**: Student academic performance deep dive
- **Faculty**: Faculty metrics, evaluations, and staffing analysis

### Analytics Section
- **Trends**: Historical trend analysis across all metrics
- **Budget**: Detailed financial reports and projections
- **Reports**: Exportable reports for board meetings and accreditation

### Administration Section
- **Settings**: Dashboard configuration and preferences
- **Notifications**: Alert management for metric thresholds
- **Help**: Documentation and support resources

---

## Metric Definitions

| Metric | Definition | Calculation Method |
|--------|-----------|-------------------|
| Total Students | Headcount of all currently enrolled students | Sum of full-time, part-time, and online enrollments |
| Graduation Rate | Percentage completing degree in standard timeframe | Graduates / entering cohort within 150% normal time |
| Faculty Count | Number of full-time and tenure-track faculty | Excludes adjuncts and part-time instructors |
| Average GPA | Institution-wide mean grade point average | Weighted average across all graded courses |
| Student-to-Faculty Ratio | Average students per faculty member | Total students / total faculty |
| Retention Rate | First-year students returning for second year | Returning sophomores / previous year's freshmen |
| Satisfaction Score | Student evaluation of educational experience | Mean of end-of-course evaluation ratings |

---

## Frequently Asked Questions

**Q: How often is the data updated?**
A: The dashboard data reflects the current academic year's most recent reporting period. Data is refreshed at the start of each semester.

**Q: Can I export the charts?**
A: Right-click on any chart to save it as an image. For data exports, use the Reports section in the sidebar.

**Q: Why might my graduation rate differ from federal reporting?**
A: The dashboard uses institutional methodology which may differ from IPEDS definitions. Federal rates exclude transfer students, while institutional rates may include them.

**Q: What does the satisfaction score represent?**
A: Satisfaction scores aggregate end-of-course evaluations using a standardized 5-point Likert scale instrument administered to all students at the end of each semester.

**Q: How are department rankings calculated?**
A: Rankings use a weighted composite score: Graduation Rate (30%), Student Satisfaction (25%), Average GPA (20%), Research Output (15%), and Retention Rate (10%).

**Q: Can I customize the dashboard view?**
A: The Settings section allows you to adjust date ranges, select specific departments to display, and configure threshold alerts for key metrics.

**Q: Is the data accessible for screen readers?**
A: The dashboard follows WCAG 2.1 AA guidelines. Chart data is available in the underlying data tables for assistive technology users.
