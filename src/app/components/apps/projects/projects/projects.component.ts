import { Component, OnInit } from '@angular/core';

interface ProjectsType {
  id: number;
  category?: string;
  img?: string;
  imgBg?: string;
  title?: string;
  opened?: string;
  members?: menebers[];
  task?: number;
  openedDate?: string;
  dueDate?: string;
  dueDateStatus?: string;
  progress?: number | any;
  progressStatus?: string | any;
}

interface menebers {
  img: string;
}

const ProjectsData: ProjectsType[] = [
  {
    id: 1,
    category: 'Inprogress',
    imgBg: 'primary',
    img: 'fe fe-code',
    title: 'WebDesign',
    opened: 'opened yesterday',
    members: [
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/11.jpg' },
      { img: './assets//images/users/1.jpg' },
      { img: './assets//images/users/2.jpg' },
      { img: './assets//images/users/3.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
      { img: './assets//images/users/6.jpg' },
      { img: './assets//images/users/7.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/10.jpg' },
    ],
    task: 28,
    openedDate: '11 Nov 21',
    dueDateStatus: 'info',
    dueDate: '16 Apr 22',
    progress: 45,
    progressStatus: 'warning',
  },
  {
    id: 2,
    category: 'Inprogress',
    imgBg: 'info',
    img: 'fe fe-cloud',
    title: 'Cloud Computing',
    opened: 'opened 1min ago',
    members: [
      { img: './assets//images/users/2.jpg' },
      { img: './assets//images/users/3.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
    ],
    task: 58,
    openedDate: '16 Mar 21',
    dueDateStatus: 'info',
    dueDate: '30 May 22',
    progress: 80,
    progressStatus: 'primary',
  },
  {
    id: 3,
    category: 'Inprogress',
    imgBg: 'warning',
    img: 'fe fe-database',
    title: 'SQL',
    opened: 'opened 1mth ago',
    members: [
      { img: './assets//images/users/1.jpg' },
      { img: './assets//images/users/2.jpg' },
      { img: './assets//images/users/3.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
      { img: './assets//images/users/6.jpg' },
      { img: './assets//images/users/7.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/10.jpg' },
    ],
    task: 350,
    openedDate: '20 Feb',
    dueDateStatus: 'info',
    dueDate: '30 Apr 22',
    progress: 70,
    progressStatus: 'info',
  },
  {
    id: 4,
    category: 'Inprogress',
    imgBg: 'info',
    img: 'fe fe-server',
    title: 'Ethical Hacking',
    opened: 'opened 3d ago',
    members: [
      { img: './assets//images/users/7.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/11.jpg' },
      { img: './assets//images/users/1.jpg' },
      { img: './assets//images/users/2.jpg' },
      { img: './assets//images/users/3.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
      { img: './assets//images/users/6.jpg' },
      { img: './assets//images/users/7.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/10.jpg' },
    ],
    task: 75,
    openedDate: '11 Dec 21',
    dueDateStatus: 'info',
    dueDate: '21 Apr 18',
    progress: 90,
    progressStatus: 'primary',
  },
  {
    id: 5,
    category: 'Inprogress',
    imgBg: 'primary',
    img: 'fa fa-server',
    title: 'Login Authentication',
    opened: 'opened 1min ago',
    members: [{ img: './assets//images/users/9.jpg' }],
    task: 15,
    openedDate: '21 Jan 22',
    dueDateStatus: 'info',
    dueDate: '10 Apr 22',
    progress: 55,
    progressStatus: 'info',
  },
  {
    id: 6,
    category: 'Inprogress',
    imgBg: 'warning',
    img: 'fa fa-laptop',
    title: 'System Design',
    opened: 'opened 2d ago',
    members: [
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/11.jpg' },
      { img: './assets//images/users/1.jpg' },
      { img: './assets//images/users/2.jpg' },
      { img: './assets//images/users/3.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
      { img: './assets//images/users/6.jpg' },
      { img: './assets//images/users/7.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/10.jpg' },
    ],
    task: 116,
    openedDate: '15 Feb 22',
    dueDateStatus: 'info',
    dueDate: '20 May 22',
    progress: 85,
    progressStatus: 'primary',
  },
  {
    id: 7,
    category: 'Onhold',
    imgBg: 'orange',
    img: 'fe fe-target',
    title: 'SEO Using React',
    opened: 'opened 4mth ago',
    members: [
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/11.jpg' },
      { img: './assets//images/users/1.jpg' },
      { img: './assets//images/users/2.jpg' },
      { img: './assets//images/users/3.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
      { img: './assets//images/users/6.jpg' },
    ],
    task: 75,
    openedDate: '11 Dec 21',
    dueDateStatus: 'danger',
    dueDate: '20 May 22',
    progress: 15,
    progressStatus: 'danger',
  },
  {
    id: 8,
    category: 'Onhold',
    imgBg: 'primary',
    img: 'fe fe-code',
    title: 'Web Design',
    opened: 'opened yesterday',
    members: [
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/11.jpg' },
      { img: './assets//images/users/1.jpg' },
      { img: './assets//images/users/2.jpg' },
      { img: './assets//images/users/3.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
      { img: './assets//images/users/6.jpg' },
      { img: './assets//images/users/7.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/10.jpg' },
    ],
    task: 28,
    openedDate: '20 Jan 21',
    dueDateStatus: 'danger',
    dueDate: '15 Jun 22',
    progress: 35,
    progressStatus: 'warning',
  },
  {
    id: 9,
    category: 'Onhold',
    imgBg: 'warning',
    img: 'fa fa-laptop',
    title: 'System Design',
    opened: 'opened 2d ago',
    members: [
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/11.jpg' },
      { img: './assets//images/users/1.jpg' },
      { img: './assets//images/users/2.jpg' },
      { img: './assets//images/users/3.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
      { img: './assets//images/users/6.jpg' },
      { img: './assets//images/users/7.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/10.jpg' },
    ],
    task: 116,
    openedDate: '15 Nov 21',
    dueDateStatus: 'danger',
    dueDate: '30 May 22',
    progress: 45,
    progressStatus: 'warning',
  },
  {
    id: 10,
    category: 'Onhold',
    imgBg: 'info',
    img: 'fe fe-server',
    title: 'Ethical Hacking',
    opened: 'opened 3d ago',
    members: [
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/11.jpg' },
      { img: './assets//images/users/1.jpg' },
      { img: './assets//images/users/2.jpg' },
      { img: './assets//images/users/3.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
      { img: './assets//images/users/6.jpg' },
      { img: './assets//images/users/7.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/10.jpg' },
    ],
    task: 75,
    openedDate: '25 Dec 21',
    dueDateStatus: 'danger',
    dueDate: '01 Aug 22',
    progress: 80,
    progressStatus: 'primary',
  },
  {
    id: 11,
    category: 'Onhold',
    imgBg: 'warning',
    img: 'fa fa-laptop',
    title: 'System Design',
    opened: 'opened 2d ago',
    members: [
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/11.jpg' },
      { img: './assets//images/users/1.jpg' },
      { img: './assets//images/users/6.jpg' },
      { img: './assets//images/users/7.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/10.jpg' },
    ],
    task: 116,
    openedDate: '22 Jan 21',
    dueDateStatus: 'danger',
    dueDate: '05 Apr 22',
    progress: 50,
    progressStatus: 'warning',
  },
  {
    id: 12,
    category: 'Onhold',
    imgBg: 'orange',
    img: 'fa fa-server',
    title: 'Login Authentication',
    opened: 'opened 1min ago',
    members: [
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
      { img: './assets//images/users/6.jpg' },
    ],
    task: 15,
    openedDate: '10 Nov 21',
    dueDateStatus: 'danger',
    dueDate: '30 Apr 22',
    progress: 55,
    progressStatus: 'info',
  },
  {
    id: 13,
    category: 'Completed',
    imgBg: 'primary',
    img: 'fe fe-code',
    title: 'Web Design',
    opened: 'opened yesterday',
    members: [
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/11.jpg' },
      { img: './assets//images/users/1.jpg' },
      { img: './assets//images/users/2.jpg' },
      { img: './assets//images/users/3.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
      { img: './assets//images/users/6.jpg' },
    ],
    task: 28,
    openedDate: '28 Mar 22',
    dueDateStatus: 'primary',
    dueDate: '21 Mar 22',
    progress: 100,
    progressStatus: 'primary',
  },
  {
    id: 14,
    category: 'Completed',
    imgBg: 'info',
    img: 'fe fe-cloud',
    title: 'Cloud Computing',
    opened: 'opened 1mth ago',
    members: [
      { img: './assets//images/users/7.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/10.jpg' },
    ],
    task: 58,
    openedDate: '27 Feb 22',
    dueDateStatus: 'primary',
    dueDate: '28 Mar 22',
    progress: 100,
    progressStatus: 'primary',
  },
  {
    id: 15,
    category: 'Completed',
    imgBg: 'warning',
    img: 'fa fa-database',
    title: 'SQL',
    opened: 'opened 1mth ago',
    members: [
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/11.jpg' },
      { img: './assets//images/users/1.jpg' },
      { img: './assets//images/users/2.jpg' },
      { img: './assets//images/users/3.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
      { img: './assets//images/users/6.jpg' },
      { img: './assets//images/users/7.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/10.jpg' },
    ],
    task: 350,
    openedDate: '20 Feb 22',
    dueDateStatus: 'primary',
    dueDate: '29 Mar 22',
    progress: 100,
    progressStatus: 'primary',
  },
  {
    id: 16,
    category: 'Completed',
    imgBg: 'info',
    img: 'fe fe-server',
    title: 'Ethical Hacking',
    opened: 'opened 3d ago',
    members: [
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/11.jpg' },
      { img: './assets//images/users/1.jpg' },
      { img: './assets//images/users/2.jpg' },
      { img: './assets//images/users/3.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
      { img: './assets//images/users/6.jpg' },
      { img: './assets//images/users/7.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/10.jpg' },
    ],
    task: 75,
    openedDate: '25 Mar 22',
    dueDateStatus: 'primary',
    dueDate: '29 Mar 22',
    progress: 100,
    progressStatus: 'primary',
  },
  {
    id: 17,
    category: 'Completed',
    imgBg: 'primary',
    img: 'fa fa-server',
    title: 'Login Authentication',
    opened: 'opened 1d ago',
    members: [
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/6.jpg' },
    ],
    task: 15,
    openedDate: '27 Mar 22',
    dueDateStatus: 'primary',
    dueDate: '28 Mar 22',
    progress: 100,
    progressStatus: 'primary',
  },
  {
    id: 18,
    category: 'Completed',
    imgBg: 'warning',
    img: 'fa fa-laptop',
    title: 'System Design',
    opened: 'opened 5d ago',
    members: [
      { img: './assets//images/users/9.jpg' },
      { img: './assets//images/users/8.jpg' },
      { img: './assets//images/users/11.jpg' },
      { img: './assets//images/users/1.jpg' },
      { img: './assets//images/users/2.jpg' },
      { img: './assets//images/users/3.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/4.jpg' },
      { img: './assets//images/users/5.jpg' },
      { img: './assets//images/users/6.jpg' },
    ],
    task: 116,
    openedDate: '24 Mar 22',
    dueDateStatus: 'primary',
    dueDate: '30 Mar 22',
    progress: 100,
    progressStatus: 'primary',
  },
];
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit {
  number = 5;
  ProjectItems!: ProjectsType[] | any;
  projectlist: any = [];
  constructor() {}

  ngOnInit(): void {
    this.ProjectItems = ProjectsData;
  }

  checkStatus(ele: any, event: any) {
    ele.target.classList.add('active');
    ele.target?.previousElementSibling?.classList.remove('active');
    ele.target?.previousElementSibling?.previousElementSibling?.previousElementSibling?.classList.remove(
      'active'
    );
    ele.target?.previousElementSibling?.previousElementSibling?.classList.remove(
      'active'
    );
    ele.target?.nextSibling?.classList.remove('active');
    ele.target?.nextSibling?.nextSibling?.classList.remove('active');
    ele.target?.nextSibling?.nextSibling?.nextSibling?.classList.remove(
      'active'
    );
    switch (event) {
      case 'all':
        this.ProjectItems = ProjectsData;
        break;
      case 'Inprogress':
        this.ProjectItems = [];
        ProjectsData.map((elem: any) => {
          if (elem.category == 'Inprogress') {
            this.ProjectItems.push(elem);
          }
        });
        break;
      case 'Onhold':
        this.ProjectItems = [];
        ProjectsData.map((elem: any) => {
          if (elem.category == 'Onhold') {
            this.ProjectItems.push(elem);
          }
        });
        break;
      case 'Completed':
        this.ProjectItems = [];
        ProjectsData.map((elem: any) => {
          if (elem.category == 'Completed') {
            this.ProjectItems.push(elem);
          }
        });
        break;
    }
  }
}
