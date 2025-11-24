export interface TaskListType{
    id:number;
    task: string;
    project: string;
    dueDate: string;
    assignedImg: string;
    name: string;
    email: string;
    status: StatesOpetion[]
}

interface StatesOpetion{
    option: string
}

export const TaskListData:TaskListType[]=[
    {id:1, task:'Sit sed takimata sanctus invidunt', project:'Noa Dashboard UI', dueDate:'31 Oct 22', assignedImg:'./assets/images/users/8.jpg', name:'Skyler Hilda', email:'member@spruko.com', status:[ {option:'In Progress'}, {option:'On Hold'}, {option: 'Completed'}] },
    {id:2, task:'Diam lorem dolor no lorem.', project:'Noa Dashboard UI', dueDate:'01 Nov 22', assignedImg:'./assets/images/users/12.jpg', name:'Daniel Obrien', email:'member@spruko.com', status:[ {option:'In Progress'}, {option:'On Hold'}, {option: 'Completed'}] },
    {id:3, task:'Amet clita sea ut dolor consetetur, elitr.', project:'Noa Dashboard UI', dueDate:'08 Nov 22', assignedImg:'./assets/images/users/13.jpg', name:'William Turner', email:'member@spruko.com', status:[ {option:'In Progress'}, {option:'On Hold'}, {option: 'Completed'}] },
    {id:4, task:'Est sea erat at kasd.', project:'Noa Dashboard UI', dueDate:'04 Nov 22', assignedImg:'./assets/images/users/4.jpg', name:'Olena Tyrell', email:'member@spruko.com', status:[ {option:'In Progress'}, {option:'On Hold'}, {option: 'Completed'}] },
    {id:5, task:'Rebum gubergren at kasd takimata clita.', project:'Noa Dashboard UI', dueDate:'29 Oct 22', assignedImg:'./assets/images/users/5.jpg', name:'Emilie Benett', email:'member@spruko.com', status:[ {option:'In Progress'}, {option:'On Hold'}, {option: 'Completed'}] },
]
