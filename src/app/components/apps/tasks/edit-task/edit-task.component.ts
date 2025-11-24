import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Editor, Toolbar, Validators } from 'ngx-editor';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.scss', '../../../forms/form-editor/form-editor.component.scss']
})
export class EditTaskComponent implements OnInit {
  model!: NgbDateStruct;
  model1!: NgbDateStruct;
  model2!: NgbDateStruct;
  constructor() { }

    // ngx editor
    editordoc = '';

    editor1!: Editor;
    toolbar1: Toolbar = [
      ['bold', 'italic'],
      ['underline', 'strike'],
      ['code', 'blockquote'],
      ['ordered_list', 'bullet_list'],
      [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
      ['link', 'image'],
      ['text_color', 'background_color'],
      ['align_left', 'align_center', 'align_right', 'align_justify'],
    ];
  
    form1:any = new FormGroup({
      editorContent: new FormControl(
        { value: '', disabled: false },
        Validators.required()
      ),
    });
  
    get doc(): AbstractControl {
      return this.form1.get('editorContent');
    }

    
    ngOnInit(): void {
      this.editor1 = new Editor();
    }
  
    ngOnDestroy(): void {
      this.editor1.destroy();
    }

  taskCategory = [
    { id: 1, name: 'Nonumy' },
    { id: 2, name: 'Sea' },
    { id: 3, name: 'Vero' },
    { id: 4, name: 'Dolore' },
    { id: 5, name: 'Lorem' },
    { id: 6, name: 'Eos' },
  ];

  selectedTaskCategory = this.taskCategory[0].name;

  project = [
    { id: 1, name: 'Noa Dashboard UI' },
    { id: 2, name: 'SAP Development' },
    { id: 3, name: 'Data Management' },
    { id: 4, name: 'Billing System' },
    { id: 5, name: 'User Management Application' },
  ];

  selectedProject = this.project[0].name;

  
  AssignedTo = [
    {
      id: 1,
      name: 'Angeline Julliet',
      avatar:'./assets/images/users/1.jpg',
    },
    {
      id: 2,
      name: 'Helena Rose',
      avatar:'./assets/images/users/2.jpg'
    },
    {
      id: 3,
      name: 'Daniel Obrien',
      avatar:'./assets/images/users/13.jpg'
    },
    {
      id: 4,
      name: 'Jorah Randy',
      avatar:'./assets/images/users/15.jpg',
    },
    {
      id: 5,
      name: 'Emma Watson',
      avatar:'./assets/images/users/3.jpg',
    },
    {
      id: 6,
      name: 'Bonny Benett',
      avatar:'./assets/images/users/5.jpg'
    },
    {
      id: 7,
      name: 'Jessie Spears',
      avatar:'./assets/images/users/7.jpg'
    },
    {
      id: 8,
      name: 'Skyler Hilda',
      avatar:'./assets/images/users/9.jpg',
    },
    {
      id: 9,
      name: 'Randy Orton',
      avatar:'./assets/images/users/11.jpg'
    },
    {
      id: 10,
      name: 'Benjamin Button',
      avatar:'./assets/images/users/14.jpg',
    },
  ];

  AssignedToList = this.AssignedTo[0].name;

  
  //ngx-dropzone
  files: File[] = [];

  onSelect(event: any) {
    console.log(event);
    this.files.push(...event.addedFiles);
  }

  onRemove(event: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }
}
