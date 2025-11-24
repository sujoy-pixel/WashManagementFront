export interface ProductsDetailsType{
    id:number;
    img: string;
    name: string;
    mail: string;
    tasks: number;
    role: string;
}

export const ProductsDetailsData:ProductsDetailsType[]=[
    {id:1, img:'assets/images/users/1.jpg', name:'Lisbon Taylor', mail:'member@spruko.com', tasks:6, role:'Member'},
    {id:2, img:'assets/images/users/12.jpg', name:'Daniel Obrien', mail:'member@spruko.com', tasks:4, role:'Admin'},
    {id:3, img:'assets/images/users/13.jpg', name:'William Turner', mail:'member@spruko.com', tasks:5, role:'Member'},
    {id:4, img:'assets/images/users/4.jpg', name:'Olena Tyrell', mail:'member@spruko.com', tasks:3, role:'Member'},
    {id:5, img:'assets/images/users/5.jpg', name:'Emilie Benett', mail:'member@spruko.com', tasks:5, role:'Member'},
]

export interface ProductsDetailsFilesType{
    id:number;
    fileName: string;
    img: string;
    imgStatus: string;
    date: string;
    type: string;
    size: string;
}

export const ProductsDetailsFilesData:ProductsDetailsFilesType[]=[
    {id:1, fileName:'noa documentation', img:'fe fe-file-text', imgStatus:'info', date:'07/10/21, 03:30', type:'doc', size:'15kb'},
    {id:2, fileName:'sample video', img:'fe fe-video', imgStatus:'danger', date:'07/10/21, 03:30', type:'mp4', size:'30mb'},
    {id:3, fileName:'sample image', img:'fe fe-image', imgStatus:'primary', date:'07/10/21, 03:30', type:'jpeg', size:'15kb'},
    {id:4, fileName:'word document', img:'fe fe-file-text', imgStatus:'info', date:'07/10/21, 03:30', type:'doc', size:'15kb'},
    {id:5, fileName:'sample audio', img:'fe fe-music', imgStatus:'warning', date:'07/10/21, 03:30', type:'mp3', size:'5.3mb'},
    {id:6, fileName:'sample video', img:'fe fe-video', imgStatus:'danger', date:'07/10/21, 03:30', type:'mp4', size:'30mb'},
    {id:7, fileName:'sample image', img:'fe fe-image', imgStatus:'primary', date:'07/10/21, 03:30', type:'jpeg', size:'15kb'},
]

export interface ProductsDetailsTaskListType{
    id:number;
    task:string;
    project?:string;
    dueDate:string;
    assignedImg?:string;
    name:string;
    email:string;
    status?:StatusOptions[]
}

interface StatusOptions{
    option?:string
}

export const ProductsDetailsTaskListData:ProductsDetailsTaskListType[]=[
    {id:1, task:'Sit sed takimata sanctus invidunt', project:'Noa Dashboard UI', dueDate:'31 Oct 22', assignedImg:'./assets/images/users/8.jpg', name:'Skyler Hilda', email:'member@spruko.com', status:[ {option:'In Progress'}, {option:'On Hold'}, {option: 'Completed'}] },
    {id:2, task:'Diam lorem dolor no lorem.', project:'Noa Dashboard UI', dueDate:'01 Nov 22', assignedImg:'./assets/images/users/12.jpg', name:'Daniel Obrien', email:'member@spruko.com', status:[ {option:'In Progress'}, {option:'On Hold'}, {option: 'Completed'}] },
    {id:3, task:'Amet clita sea ut dolor consetetur, elitr.', project:'Noa Dashboard UI', dueDate:'08 Nov 22', assignedImg:'./assets/images/users/13.jpg', name:'William Turner', email:'member@spruko.com', status:[ {option:'In Progress'}, {option:'On Hold'}, {option: 'Completed'}] },
    {id:4, task:'Est sea erat at kasd.', project:'Noa Dashboard UI', dueDate:'04 Nov 22', assignedImg:'./assets/images/users/4.jpg', name:'Olena Tyrell', email:'member@spruko.com', status:[ {option:'In Progress'}, {option:'On Hold'}, {option: 'Completed'}] },
    {id:5, task:'Rebum gubergren at kasd takimata clita.', project:'Noa Dashboard UI', dueDate:'29 Oct 22', assignedImg:'./assets/images/users/5.jpg', name:'Emilie Benett', email:'member@spruko.com', status:[ {option:'In Progress'}, {option:'On Hold'}, {option: 'Completed'}] },
]

export interface ProductsDetailsTimeTrackingType{
    id:number;
    teamMemberImg?:string;
    teamMembername:string;
    teamMemberemail:string;
    task:string;
    project?:string;
    startDateTime:string;
    endDateTime:string;
    totalTime: string;
}

export const ProductsDetailsTimeTrackingData:ProductsDetailsTimeTrackingType[]=[
    {id:1, teamMemberImg:'./assets/images/users/1.jpg', teamMembername:'Helena Rose', teamMemberemail:'member@spruko.com', task:'Sea amet dolore et sea duo sit.', project:'Noa Dashboard UI', startDateTime:'20 Oct 21 & 14:00', endDateTime:'25 Nov 21 & 09:35', totalTime:'Days: 5 Hours: 5 Minutes: 35'},
    {id:2, teamMemberImg:'./assets/images/users/12.jpg', teamMembername:'Jack Ryan', teamMemberemail:'member@spruko.com', task:'Voluptua magna no takimata nonumy.', project:'Noa Dashboard UI', startDateTime:'15 Oct 21 & 15:56', endDateTime:'01 Nov 21 & 16:40', totalTime:'Days: 18 Hours: 8 Minutes: 52'},
    {id:3, teamMemberImg:'./assets/images/users/2.jpg', teamMembername:'Jessica Grace', teamMemberemail:'member@spruko.com', task:'Justo et et ipsum lorem stet.', project:'Noa Dashboard UI', startDateTime:'20 Oct 21 & 14:00', endDateTime:'25 Nov 21 & 09:35', totalTime:'Days: 5 Hours: 5 Minutes: 35'},
    {id:4, teamMemberImg:'./assets/images/users/3.jpg', teamMembername:'Jessie Spears', teamMemberemail:'member@spruko.com', task:'Dolore dolor diam sit consetetur.', project:'Noa Dashboard UI', startDateTime:'30 Oct 21 & 12:56', endDateTime:'11 Nov 21 & 09:35', totalTime:'Days: 15 Hours: 12 Minutes: 52'},
    {id:5, teamMemberImg:'./assets/images/users/4.jpg', teamMembername:'Jorah Randy', teamMemberemail:'member@spruko.com', task:'Sanctus ipsum eirmod kasd sit.', project:'Noa Dashboard UI', startDateTime:'18 Oct 21 & 10:30', endDateTime:'09 Nov 21 & 09:45', totalTime:'Days: 22 Hours: 10 Minutes: 12'},
    {id:6, teamMemberImg:'./assets/images/users/5.jpg', teamMembername:'Lisa Morgan', teamMemberemail:'member@spruko.com', task:'Et sadipscing et vero vero ipsum.', project:'Noa Dashboard UI', startDateTime:'30 Oct 21 & 12:56', endDateTime:'11 Nov 21 & 09:35', totalTime:'Days: 15 Hours: 12 Minutes: 52'},
    {id:7, teamMemberImg:'./assets/images/users/6.jpg', teamMembername:'Lisbon Taylor', teamMemberemail:'member@spruko.com', task:'Magna voluptua elitr nonumy kasd consetetur sit.', project:'Noa Dashboard UI', startDateTime:'	31 Oct 21 & 14:56', endDateTime:'01 Nov 21 & 09:35', totalTime:'	Days: 4 Hours: 10 Minutes: 22'},
    {id:8, teamMemberImg:'./assets/images/users/7.jpg', teamMembername:'Mark Ronson', teamMemberemail:'member@spruko.com', task:'Sadipscing sanctus et tempor dolores tempor labore.', project:'Noa Dashboard UI', startDateTime:'18 Oct 21 & 10:30', endDateTime:'09 Nov 21 & 09:45', totalTime:'Days: 22 Hours: 10 Minutes: 12'},
    {id:9, teamMemberImg:'./assets/images/users/8.jpg', teamMembername:'Skyler Hilda', teamMemberemail:'member@spruko.com', task:'Et ipsum invidunt et labore.', project:'Noa Dashboard UI', startDateTime:'31 Oct 21 & 14:56', endDateTime:'01 Nov 21 & 09:35', totalTime:'Days: 4 Hours: 10 Minutes: 22'},
    {id:10, teamMemberImg:'./assets/images/users/9.jpg', teamMembername:'Tyler Durder', teamMemberemail:'member@spruko.com', task:'Et takimata invidunt sit elitr ea.', project:'Noa Dashboard UI', startDateTime:'15 Oct 21 & 15:56', endDateTime:'01 Nov 21 & 16:40', totalTime:'Days: 18 Hours: 8 Minutes: 52'},
    
]

export interface ProductsDetailsTicketsType{
    id:number;
    ticketId: string;
    title:string;
    client:string;
    ticketType:string;
    assignedImg?:string;
    name:string;
    email:string;
    status?:StatusOptions[]
}

interface StatusOptions{
    option?:string
}

export const ProductsDetailsTicketsData:ProductsDetailsTicketsType[]=[
    {id:1, ticketId:'TCKT1116', title:'Aliquyam sit ea vero et elitr.', client:'Jessica Rose', ticketType:'General Support', assignedImg:'./assets/images/users/8.jpg', name:'Skyler Hilda', email:'member@spruko.com', status:[ {option:'Open'}, {option:'Closed'}, {option: 'Pending'}, {option: 'Resolved'}] },
    {id:2, ticketId:'TCKT1117', title:'Et sed est erat et magna, gubergren.', client:'Catlyn Stark', ticketType:'General Support', assignedImg:'./assets/images/users/15.jpg', name:'Steve Johnson', email:'member@spruko.com', status:[ {option:'Open'}, {option:'Closed'}, {option: 'Pending'}, {option: 'Resolved'}] },
    {id:3, ticketId:'TCKT1118', title:'Et kasd amet aliquyam stet labore.', client:'Lisbon Murillo', ticketType:'General Support', assignedImg:'./assets/images/users/7.jpg', name:'Angeline Julliet', email:'member@spruko.com', status:[ {option:'Open'}, {option:'Closed'}, {option: 'Pending'}, {option: 'Resolved'}] },
    {id:4, ticketId:'TCKT1119', title:'Sed et magna ipsum at eirmod et.', client:'Sansa Taylor', ticketType:'General Support', assignedImg:'./assets/images/users/6.jpg', name:'Benjamin Button', email:'member@spruko.com', status:[ {option:'Open'}, {option:'Closed'}, {option: 'Pending'}, {option: 'Resolved'}] },
    {id:5, ticketId:'TCKT1120', title:'Voluptua sit sit est erat elitr.', client:'Stark Jessica', ticketType:'General Support', assignedImg:'./assets/images/users/1.jpg', name:'Emma Watson', email:'member@spruko.com', status:[ {option:'Open'}, {option:'Closed'}, {option: 'Pending'}, {option: 'Resolved'}] },
    {id:6, ticketId:'TCKT1121', title:'Lorem gubergren est consetetur lorem erat lorem lorem.', client:'Rose Murillo', ticketType:'General Support', assignedImg:'./assets/images/users/2.jpg', name:'Bonny Benett', email:'member@spruko.com', status:[ {option:'Open'}, {option:'Closed'}, {option: 'Pending'}, {option: 'Resolved'}] },
]

export interface ProductsDetailsBillingsType{
    id:number;
    invoiceId: string;
    project: string;
    img:string;
    name: string;
    email: string;
    amountTotal: string;
    paid:string;
    unpaid: string;
    date: string;
    status: StatusOptions[]
}

export const ProductsDetailsBillingsData:ProductsDetailsBillingsType[]=[
    {id: 1, invoiceId:'#INV-1116', project:'Noa Dashboard UI', img:'./assets/images/users/1.jpg', name:'Skyler Hilda', email:'member@spruko.com', amountTotal: '$1116', paid: '$773', unpaid: '$343', date:'31 Oct 21', status:[ {option:'Paid'}, {option:'Unpaid'}, {option:'Overdue'}]},
    {id: 2, invoiceId:'#INV-1117', project:'Noa Dashboard UI', img:'./assets/images/users/2.jpg', name:'Jessica Rose', email:'member@spruko.com', amountTotal: '$1116', paid: '$114', unpaid: '$200', date:'02 Nov 21', status:[ {option:'Paid'}, {option:'Unpaid'}, {option:'Overdue'}]},
    {id: 3, invoiceId:'#INV-1118', project:'Noa Dashboard UI', img:'./assets/images/users/3.jpg', name:'Sansa Taylor', email:'member@spruko.com', amountTotal: '$1116', paid: '$55', unpaid: '$450', date:'15 Nov 21', status:[ {option:'Paid'}, {option:'Unpaid'}, {option:'Overdue'}]},
    {id: 4, invoiceId:'#INV-1119', project:'Noa Dashboard UI', img:'./assets/images/users/4.jpg', name:'Lisbon Murillo', email:'member@spruko.com', amountTotal: '$1116', paid: '$630', unpaid: '$370', date:'20 Nov 21', status:[ {option:'Paid'}, {option:'Unpaid'}, {option:'Overdue'}]},
    {id: 5, invoiceId:'#INV-1120', project:'Noa Dashboard UI', img:'./assets/images/users/5.jpg', name:'Lisa Morgan', email:'member@spruko.com', amountTotal: '$1116', paid: '$555', unpaid: '$445', date:'30 Nov 21', status:[ {option:'Paid'}, {option:'Unpaid'}, {option:'Overdue'}]},
    {id: 6, invoiceId:'#INV-1121', project:'Noa Dashboard UI', img:'./assets/images/users/6.jpg', name:'Stark Jessica', email:'member@spruko.com', amountTotal: '$1116', paid: '$900', unpaid: '$100', date:'30 Nov 21', status:[ {option:'Paid'}, {option:'Unpaid'}, {option:'Overdue'}]},
    {id: 7, invoiceId:'#INV-1122', project:'Noa Dashboard UI', img:'./assets/images/users/7.jpg', name:'Taylor Hilda', email:'member@spruko.com', amountTotal: '$1116', paid: '$890', unpaid: '$110', date:'11 Dec 21', status:[ {option:'Paid'}, {option:'Unpaid'}, {option:'Overdue'}]},
    {id: 8, invoiceId:'#INV-1123', project:'Noa Dashboard UI', img:'./assets/images/users/8.jpg', name:'Catlyn Stark', email:'member@spruko.com', amountTotal: '$1116', paid: '$720', unpaid: '$280', date:'20 Dec 21', status:[ {option:'Paid'}, {option:'Unpaid'}, {option:'Overdue'}]}
]