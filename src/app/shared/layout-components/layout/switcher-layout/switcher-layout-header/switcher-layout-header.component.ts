import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/shared/services/firebase/auth.service';
import { Menu, NavService } from 'src/app/shared/services/nav.service';
import { SwitcherService } from 'src/app/shared/services/switcher.service';

@Component({
  selector: 'app-switcher-layout-header',
  templateUrl: './switcher-layout-header.component.html',
  styleUrls: ['./switcher-layout-header.component.scss'],
})
export class SwitcherLayoutHeaderComponent implements OnInit {
  public isCollapsed = true;

  constructor(
    public SwitcherService: SwitcherService,
    public navServices: NavService,
    private auth: AuthService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  signout() {
    this.auth.SignOut();
    this.router.navigate(['/auth/login']);
  }

  open(content: any) {
    this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
      size: 'lg',
    });
  }

  // Search
  public menuItems!: Menu[];
  public items!: Menu[];
  public text!: string;
  public SearchResultEmpty: boolean = false;

  ngOnInit(): void {
    // this.navServices.items.subscribe((menuItems) => {
    //   this.items = menuItems;
    // });
    this.items=[];
  }
  Search(searchText: any) {
    if (!searchText) return (this.menuItems = []);
    // items array which stores the elements
    let items: any[] = [];
    // Converting the text to lower case by using toLowerCase() and trim() used to remove the spaces from starting and ending
    searchText = searchText.toLowerCase().trim();
    this.items.filter((menuItems: any) => {
      // checking whether menuItems having title property, if there was no title property it will return
      if (!menuItems?.title) return false;
      //  checking wheteher menuitems type is text or string and checking the titles of menuitems
      if (
        menuItems.type === 'link' &&
        menuItems.title.toLowerCase().includes(searchText)
      ) {
        // Converting the menuitems title to lowercase and checking whether title is starting with same text of searchText
        if (menuItems.title.toLowerCase().startsWith(searchText)) {
          // If you want to get all the data with matching to letter entered remove this line(condition and leave items.push(menuItems))
          // If both are matching then the code is pushed to items array
          items.push(menuItems);
        }
      }
      //  checking whether the menuItems having children property or not if there was no children the return
      if (!menuItems.children) return false;
      menuItems.children.filter((subItems: any) => {
        if (
          subItems.type === 'link' &&
          subItems.title.toLowerCase().includes(searchText)
        ) {
          if (subItems.title.toLowerCase().startsWith(searchText)) {
            // If you want to get all the data with matching to letter entered remove this line(condition and leave items.push(subItems))
            items.push(subItems);
          }
        }
        if (!subItems.children) return false;
        subItems.children.filter((subSubItems: any) => {
          if (subSubItems.title.toLowerCase().includes(searchText)) {
            if (subSubItems.title.toLowerCase().startsWith(searchText)) {
              // If you want to get all the data with matching to letter entered remove this line(condition and leave items.push(subSubItems))
              items.push(subSubItems);
            }
          }
        });
        return;
      });
      return (this.menuItems = items);
    });
    // Used to show the No search result found box if the length of the items is 0
    if (!items.length) {
      this.SearchResultEmpty = true;
    } else {
      this.SearchResultEmpty = false;
    }
    return;
  }

  //  Used to clear previous search result
  clearSearch() {
    // this.text = '';
    // this.menuItems = [];
    // this.SearchResultEmpty = false;
    // return this.text, this.menuItems;
  }
}
