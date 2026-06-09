import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateWiseHourlyQcReportComponent } from './date-wise-hourly-qc-report.component';

describe('DateWiseHourlyQcReportComponent', () => {
  let component: DateWiseHourlyQcReportComponent;
  let fixture: ComponentFixture<DateWiseHourlyQcReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateWiseHourlyQcReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateWiseHourlyQcReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
