import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { NgbCalendar, NgbDateAdapter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs';
import { DataService, Person } from './data.service';


interface OptionData {
  value: string;
  viewValue: string;
}

interface OptionDataGroup {
  disabled?: boolean;
  name: string;
  OptionData: OptionData[];
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null,form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-form-advanced',
  templateUrl: './form-advanced.component.html',
  styleUrls: ['./form-advanced.component.scss'],
})
export class FormAdvancedComponent implements OnInit {
  constructor(private ngbCalendar: NgbCalendar, private dateAdapter: NgbDateAdapter<string>, private dataService: DataService) {}

  // Select with custom trigger text
  toppings = new FormControl();

  toppingList: string[] = [
    'Angeline Julliet',
    'Helena Rose',
    'Daniel Obrien',
    'Jorah Randy',
    'Emma Watson',
    'Bonny Benett',
    'Jessie Spears',
    'Skyler Hilda',
    'Randy Orton',
    'Benjamin Button',
  ];
  // Disable
  disableSelect = new FormControl(false);

  // Select with a custom ErrorStateMatcher
  selected = new FormControl('valid', [
    Validators.required,
    Validators.pattern('valid'),
  ]);

  selectFormControl = new FormControl('valid', [
    Validators.required,
    Validators.pattern('valid'),
  ]);

  nativeSelectFormControl = new FormControl('valid', [
    Validators.required,
    Validators.pattern('valid'),
  ]);

  matcher = new MyErrorStateMatcher();

  // Option group
  OptionDataControl = new FormControl();
  OptionDataGroups: OptionDataGroup[] = [
    {
      name: 'Grass',
      OptionData: [
        { value: 'bulbasaur-0', viewValue: 'Bulbasaur' },
        { value: 'oddish-1', viewValue: 'Oddish' },
        { value: 'bellsprout-2', viewValue: 'Bellsprout' },
      ],
    },
    {
      name: 'Water',
      OptionData: [
        { value: 'squirtle-3', viewValue: 'Squirtle' },
        { value: 'psyduck-4', viewValue: 'Psyduck' },
        { value: 'horsea-5', viewValue: 'Horsea' },
      ],
    },
    {
      name: 'Fire',
      disabled: true,
      OptionData: [
        { value: 'charmander-6', viewValue: 'Charmander' },
        { value: 'vulpix-7', viewValue: 'Vulpix' },
        { value: 'flareon-8', viewValue: 'Flareon' },
      ],
    },
    {
      name: 'Psychic',
      OptionData: [
        { value: 'mew-9', viewValue: 'Mew' },
        { value: 'mewtwo-10', viewValue: 'Mewtwo' },
      ],
    },
  ];

  // two way databinding
  selectedData = 'option2';

  //ngx-dropzone
  files: File[] = [];

  onSelect(event: any) {
    this.files.push(...event.addedFiles);
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }
  //
  options = [{ value: 'This is value 1', checked: true }];
  statuses = ['control'];

  // name = "Angular";//
  fileToUpload: any;
  imageUrl: any;
  handleFileInput(file: FileList | any) {
    this.fileToUpload = file.target.files.item(0);

    //Show image preview
    let reader = new FileReader();
    reader.onload = (event: any) => {
      this.imageUrl = event.target.result;
    };
    reader.readAsDataURL(this.fileToUpload);
  }
  // datepicker start date
  startDate = new Date();

  // ng calendar
  model2!: string;

  get today() {
    return this.dateAdapter.toModel(this.ngbCalendar.getToday())!;
  }

  model1!: NgbDateStruct;
  placement = 'bottom';

  // ng-select

  // with search

  cities = [
    { id: 1, name: 'Chuck Testa' },
    { id: 2, name: 'Sage Cattabriga-Alosa' },
    { id: 3, name: 'Nikola Tesla' },
    { id: 4, name: 'Cattabriga-Alosa' },
  ];

  selectedCity = this.cities[0].name;

  withAvatar = [
    {
      id: 1,
      name: 'Vilnius',
      avatar:
        '//www.gravatar.com/avatar/b0d8c6e5ea589e6fc3d3e08afb1873bb?d=retro&r=g&s=30 2x',
    },
    {
      id: 2,
      name: 'Kaunas',
      avatar:
        '//www.gravatar.com/avatar/ddac2aa63ce82315b513be9dc93336e5?d=retro&r=g&s=15',
    },
    {
      id: 3,
      name: 'Pavilnys',
      avatar:
        '//www.gravatar.com/avatar/6acb7abf486516ab7fb0a6efa372042b?d=retro&r=g&s=15',
    },
    {
      id: 4,
      name: 'Siauliai',
      avatar:
        '//www.gravatar.com/avatar/b0d8c6e5ea589e6fc3d3e08afb1873bb?d=retro&r=g&s=30 2x',
    },
  ];

  withAvatarList = this.withAvatar[0].name;

  //
  multiSelectSelected = ['Michael'];
  multiSelect = [
    {
      name: 'Jill',
      email: 'jill@email.com',
      age: 15,
      country: undefined,
      child: { state: 'Active' },
    },
    {
      name: 'Henry',
      email: 'henry@email.com',
      age: 10,
      country: undefined,
      child: { state: 'Active' },
    },
    {
      name: 'Meg',
      email: 'meg@email.com',
      age: 7,
      country: null,
      child: { state: 'Active' },
    },
    {
      name: 'Adam',
      email: 'adam@email.com',
      age: 12,
      country: 'United States',
      child: { state: 'Active' },
    },
    {
      name: 'Homer',
      email: 'homer@email.com',
      age: 47,
      country: '',
      child: { state: 'Active' },
    },
    {
      name: 'Samantha',
      email: 'samantha@email.com',
      age: 30,
      country: 'United States',
      child: { state: 'Active' },
    },
    {
      name: 'Amalie',
      email: 'amalie@email.com',
      age: 12,
      country: 'Argentina',
      child: { state: 'Active' },
    },
    {
      name: 'Estefanía',
      email: 'estefania@email.com',
      age: 21,
      country: 'Argentina',
      child: { state: 'Active' },
    },
    {
      name: 'Adrian',
      email: 'adrian@email.com',
      age: 21,
      country: 'Ecuador',
      child: { state: 'Active' },
    },
    {
      name: 'Wladimir',
      email: 'wladimir@email.com',
      age: 30,
      country: 'Ecuador',
      child: { state: 'Inactive' },
    },
    {
      name: 'Natasha',
      email: 'natasha@email.com',
      age: 54,
      country: 'Ecuador',
      child: { state: 'Inactive' },
    },
    {
      name: 'Nicole',
      email: 'nicole@email.com',
      age: 43,
      country: 'Colombia',
      child: { state: 'Inactive' },
    },
    {
      name: 'Michael',
      email: 'michael@email.com',
      age: 15,
      country: 'Colombia',
      child: { state: 'Inactive' },
    },
    {
      name: 'Nicolás',
      email: 'nicole@email.com',
      age: 43,
      country: 'Colombia',
      child: { state: 'Inactive' },
    },
  ];
  multiSelectGroupSelected = ['Michael'];
  multiSelectGroup = [
    {
      name: 'Jill',
      email: 'jill@email.com',
      age: 15,
      country: undefined,
      child: { state: 'Active' },
    },
    {
      name: 'Henry',
      email: 'henry@email.com',
      age: 10,
      country: undefined,
      child: { state: 'Active' },
    },
    {
      name: 'Meg',
      email: 'meg@email.com',
      age: 7,
      country: null,
      child: { state: 'Active' },
    },
    {
      name: 'Adam',
      email: 'adam@email.com',
      age: 12,
      country: 'United States',
      child: { state: 'Active' },
    },
    {
      name: 'Homer',
      email: 'homer@email.com',
      age: 47,
      country: '',
      child: { state: 'Active' },
    },
    {
      name: 'Samantha',
      email: 'samantha@email.com',
      age: 30,
      country: 'United States',
      child: { state: 'Active' },
    },
    {
      name: 'Amalie',
      email: 'amalie@email.com',
      age: 12,
      country: 'Argentina',
      child: { state: 'Active' },
    },
    {
      name: 'Estefanía',
      email: 'estefania@email.com',
      age: 21,
      country: 'Argentina',
      child: { state: 'Active' },
    },
    {
      name: 'Adrian',
      email: 'adrian@email.com',
      age: 21,
      country: 'Ecuador',
      child: { state: 'Active' },
    },
    {
      name: 'Wladimir',
      email: 'wladimir@email.com',
      age: 30,
      country: 'Ecuador',
      child: { state: 'Inactive' },
    },
    {
      name: 'Natasha',
      email: 'natasha@email.com',
      age: 54,
      country: 'Ecuador',
      child: { state: 'Inactive' },
    },
    {
      name: 'Nicole',
      email: 'nicole@email.com',
      age: 43,
      country: 'Colombia',
      child: { state: 'Inactive' },
    },
    {
      name: 'Michael',
      email: 'michael@email.com',
      age: 15,
      country: 'Colombia',
      child: { state: 'Inactive' },
    },
    {
      name: 'Nicolás',
      email: 'nicole@email.com',
      age: 43,
      country: 'Colombia',
      child: { state: 'Inactive' },
    },
  ];

  groupByFn = (item: any) => item.child.state;

  groupValueFn = (_: string, children: any[]) => ({
    name: children[0].child.state,
    total: children.length,
  });

  compareAccounts = (item: any, selected: any) => {
    if (selected.country && item.country) {
      return item.country === selected.country;
    }
    if (item.name && selected.name) {
      return item.name === selected.name;
    }
    return false;
  };

  people: Person[] = [];
  selectedPeople:any = [];

  ngOnInit(): void {
    this.dataService
      .getPeople()
      .pipe(map((x) => x.filter((y) => !y.disabled)))
      .subscribe((res) => {
        this.people = res;
        this.selectedPeople = [this.people[0].id];
      });
  }
}
