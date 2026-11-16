import { Component, OnInit, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { WashSetupService } from '../../../services/washsetup.service';

/**
 * Wash Item Delivery -> opens GatePass "Wash Dispatch" in a new tab, signed in as the
 * current Wash user. The API (api/GatePassSso/Url) runs sp_GetUserCredentialByIdForWash
 * and returns .../WashDispatch/Index?MenuId=2484&username=<id>&pass=<encrypted>.
 */
@Component({
  selector: 'app-wash-item-delivery',
  templateUrl: './wash-item-delivery.component.html',
  styleUrls: ['./wash-item-delivery.component.scss']
})
export class WashItemDeliveryComponent implements OnInit {

  private readonly gatePassPath = '/WashDispatch/Index?MenuId=2484';
  private document = inject(DOCUMENT);

  isOpening = false;
  gatePassUrl = '';          // shown as a link - a real click on it is never popup-blocked
  errorMessage = '';
  popupBlocked = false;

  constructor(
    private service: WashSetupService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAndOpen();
  }

  /** Gets the link from the API, then tries to open it in a new tab. */
  loadAndOpen(): void {
    this.isOpening = true;
    this.errorMessage = '';
    this.popupBlocked = false;

    this.service.getGatePassSsoUrl(this.gatePassPath).subscribe({
      next: res => {
        this.isOpening = false;
        this.gatePassUrl = res?.url || '';
        console.log('GatePass URL:', this.gatePassUrl);

        if (!this.gatePassUrl) {
          this.errorMessage = 'The API returned no GatePass link.';
          return;
        }
        this.openInNewTab();
      },
      error: err => {
        this.isOpening = false;
        // API errors are plain text; Angular wraps them in err.error.text when it can't parse JSON
        const e = err?.error;
        this.errorMessage =
          (typeof e === 'string' ? e : e?.text || e?.message || e?.title) ||
          `Could not get the GatePass link (HTTP ${err?.status ?? '?'})`;
        console.error('GatePass link error:', err);
        this.toastr.error(this.errorMessage, 'GatePass');
      }
    });
  }

  /** Opens the link; if the browser blocks it, the page shows the link to click. */
  openInNewTab(): void {
    // no 'noopener' feature here: with it, open() always returns null and a block can't be detected
    const tab = this.document.defaultView?.open(this.gatePassUrl, '_blank');
    if (tab) {
      tab.opener = null;           // the GatePass tab can't reach back into Wash
      this.popupBlocked = false;
    } else {
      this.popupBlocked = true;    // blocked: the page shows the link to click
    }
  }
}
