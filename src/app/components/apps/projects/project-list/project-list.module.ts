
export interface ProjectListType{
    id:number;
    title?:string;
    task?:string;
    date?:string;
    member?:Member[];
    dueDate?: string;
    progress?: number;
    progressStatus?: string;
    submittedDate?:string;
    status?:string;
    statusText?:string;
}

interface Member{
    img?:string;
}

export const ProjectListData: ProjectListType[] = [
  { id: 1,title:'Web Designing',task:'28',date:'10 Aug 21',member:[
    {img:'assets/images/users/1.jpg'},
    {img:'assets/images/users/2.jpg'},
    {img:'assets/images/users/3.jpg'},
    {img:'assets/images/users/4.jpg'},
    {img:'assets/images/users/5.jpg'},
  ],dueDate:'11 Nov 22',progress:35,progressStatus:'warning',submittedDate:'---',status:'warning',statusText:'On Hold'},
  { id: 2,title:'Cloud Computing',task:'58',date:'21 Jan 22',member:[
    {img:'assets/images/users/6.jpg'},
    {img:'assets/images/users/7.jpg'},
    {img:'assets/images/users/8.jpg'},
  ],dueDate:'28 Apr 22',progress:62,progressStatus:'info',submittedDate:'---',status:'info',statusText:'In Progress'},
  { id: 3,title:'Ethical Hacking',task:'75',date:'21 Jul 12',member:[
    {img:'assets/images/users/9.jpg'},
    {img:'assets/images/users/10.jpg'},
    {img:'assets/images/users/11.jpg'},
    {img:'assets/images/users/12.jpg'},
    {img:'assets/images/users/13.jpg'},
    {img:'assets/images/users/14.jpg'},
    {img:'assets/images/users/15.jpg'},
  ],dueDate:'---',progress:100,progressStatus:'success',submittedDate:'21 Feb 21',status:'primary',statusText:'completed'},
  { id: 4,title:'SEO Using React',task:'118',date:'24 Dec 21',member:[
    {img:'assets/images/users/15.jpg'},
    {img:'assets/images/users/8.jpg'},
    {img:'assets/images/users/11.jpg'},
    {img:'assets/images/users/9.jpg'},
    {img:'assets/images/users/9.jpg'},
    {img:'assets/images/users/8.jpg'},
    {img:'assets/images/users/11.jpg'},
    {img:'assets/images/users/9.jpg'},
    {img:'assets/images/users/9.jpg'},
  ],dueDate:'24 Apr 21',progress:15,progressStatus:'danger',submittedDate:'---',status:'warning',statusText:'On Hold'},
  { id: 5,title:'System Design',task:'116',date:'24 Jan 21',member:[
    {img:'assets/images/users/9.jpg'},
    {img:'assets/images/users/8.jpg'},
    {img:'assets/images/users/11.jpg'},
    {img:'assets/images/users/12.jpg'},
    {img:'assets/images/users/9.jpg'},
    {img:'assets/images/users/8.jpg'},
    {img:'assets/images/users/11.jpg'},
    {img:'assets/images/users/12.jpg'},
    {img:'assets/images/users/11.jpg'},
    {img:'assets/images/users/12.jpg'}
  ],dueDate:'---',progress:100,progressStatus:'success',submittedDate:'16 Mar 21',status:'primary',statusText:'completed'},
  { id: 6,title:'Login Authentication',task:'15',date:'16 Apr 21',member:[
    {img:'assets/images/users/9.jpg'},
    {img:'assets/images/users/8.jpg'},
    {img:'assets/images/users/11.jpg'},
    {img:'assets/images/users/1.jpg'}
  ],dueDate:'---',progress:100,progressStatus:'success',submittedDate:'29 Dec 21',status:'primary',statusText:'completed'},
  { id: 7,title:'Web Designing',task:'28',date:'10 Aug 21',member:[
    { img:'./assets/images/users/9.jpg'},
    { img:'./assets/images/users/8.jpg'},
    { img:'./assets/images/users/11.jpg'},
    { img:'./assets/images/users/1.jpg'},
    { img:'./assets/images/users/6.jpg'},
    { img:'./assets/images/users/9.jpg'},
    { img:'./assets/images/users/8.jpg'},
    { img:'./assets/images/users/11.jpg'},
    { img:'./assets/images/users/1.jpg'},
    { img:'./assets/images/users/6.jpg'}
  ],dueDate:'30 Apr 22',progress:35,progressStatus:'warning',submittedDate:'---',status:'warning',statusText:'On Hold'},
  { id: 8,title:'Server Side Validation',task:'58',date:'21 Jan 22',member:[
    { img:'./assets/images/users/9.jpg'},
    { img:'./assets/images/users/8.jpg'},
    { img:'./assets/images/users/11.jpg'}
  ],dueDate:'16 Apr 22',progress:55,progressStatus:'info',submittedDate:'---',status:'info',statusText:'In Progress'},
  { id: 9,title:'Database Administration',task:'75',date:'21 Jul 21',member:[
    { img:'./assets/images/users/9.jpg'},
    { img:'./assets/images/users/8.jpg'},
    { img:'./assets/images/users/11.jpg'},
    { img:'./assets/images/users/9.jpg'},
    { img:'./assets/images/users/8.jpg'},
    { img:'./assets/images/users/11.jpg'},
    { img:'./assets/images/users/11.jpg'}
  ],dueDate:'---',progress:100,progressStatus:'success',submittedDate:'21 Mar 22',status:'primary',statusText:'completed'},
  { id: 10,title:'SEO Using React',task:'118',date:'24 Apr 21',member:[
    { img:'./assets/images/users/9.jpg'},
    { img:'./assets/images/users/8.jpg'},
    { img:'./assets/images/users/11.jpg'},
    { img:'./assets/images/users/9.jpg'},
    { img:'./assets/images/users/8.jpg'},
    { img:'./assets/images/users/11.jpg'},
    { img:'./assets/images/users/9.jpg'},
    { img:'./assets/images/users/8.jpg'},
    { img:'./assets/images/users/11.jpg'}
  ],dueDate:'25 Nov 22',progress:25,progressStatus:'danger',submittedDate:'---',status:'warning',statusText:'On Hold'},
  { id: 11,title:'System Design',task:'116',date:'24 Jan 22',member:[
    { img:'./assets/images/users/9.jpg'},
    { img:'./assets/images/users/8.jpg'},
    { img:'./assets/images/users/11.jpg'},
    { img:'./assets/images/users/9.jpg'},
    { img:'./assets/images/users/8.jpg'},
    { img:'./assets/images/users/11.jpg'},
    { img:'./assets/images/users/11.jpg'}
  ],dueDate:'---',progress:100,progressStatus:'success',submittedDate:'16 Apr 22',status:'primary',statusText:'completed'},
  { id: 12,title:'Login Authentication',task:'15',date:'16 Apr 21',member:[
    { img:'./assets/images/users/9.jpg'},
    { img:'./assets/images/users/8.jpg'},
    { img:'./assets/images/users/11.jpg'}
  ],dueDate:'29 Dec 21',progress:70,progressStatus:'info',submittedDate:'---',status:'info',statusText:'In Progress'},
  
];