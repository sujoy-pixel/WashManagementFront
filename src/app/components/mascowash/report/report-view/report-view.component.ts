
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-report-view',
  templateUrl: './report-view.component.html',
  styleUrls: ['./report-view.component.scss']
})
export class ReportViewComponent {
  safeReportUrl: SafeResourceUrl | null = null;
  reportParams: any = {};
  constructor(private sanitizer: DomSanitizer, private route: ActivatedRoute) {}

 ngOnInit(): void {
   // Get URL from query parameters
   debugger;
   const reportUrl = this.route.snapshot.queryParamMap.get('url');
 
    if (reportUrl) {
      this.safeReportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(reportUrl);
    }

    // Get other parameters (like CompanyId, FromDate, etc.) from query parameters
   this.route.queryParamMap.subscribe(params => {
      //alert("view");
      this.reportParams = params;  // This will contain all the parameters (CompanyId, FromDate, etc.)
      console.log(this.reportParams);  // You can now use these parameters as needed
    });
  }
}
