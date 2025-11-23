const join = {"users": [
  {
    id: 1,
    name: "Anja Schulz",
    email: "schulz@hotmail.com",
    phone: "+49 2222222222",
    password: "mypassword123",
    login: 1,
    badge: "./assets/profilebadge/anja.svg",
    color: "rgb(148,36,252)",
  },
  {
    id: 2,
    name: "Benedikt Ziegler",
    email: "benedikt@gmail.com",
    phone: "+49 3333333333",
    password: "mypassword123",
    login: 0,
    badge: "./assets/profilebadge/benedikt.svg",
    color: "#7c61fc",
  },
  {
    id: 3,
    name: "David Eisenberg",
    email: "davidberg@gmail.com",
    phone: "+49 4444444444",
    password: "mypassword123",
    login: 0,
    badge: "./assets/profilebadge/david.svg",
    color: "#fcaafc",
  },
  {
    id: 4,
    name: "Eva Fischer",
    email: "eva@gmail.com",
    phone: "+49 5555555555",
    password: "mypassword123",
    login: 0,
    badge: "./assets/profilebadge/eva.svg",
    color: "#fccc59",
  },
  {
    id: 5,
    name: "Emmanuel Mauer",
    email: "emmanuelma@gmail.com",
    phone: "+49 6666666666",
    password: "mypassword123",
    login: 0,
    badge: "./assets/profilebadge/emmanuel.svg",
    color: "#34dcc4"
  },
  {
    id: 6,
    name: "Marcel Bauer",
    email: "bauer@gmail.com",
    phone: "+49 7777777777",
    password: "mypassword123",
    login: 0,
    badge: "./assets/profilebadge/marcel.svg",
    color: "#442c8c",
  },
  {
    id: 7,
    name: "Tatjana Wolf",
    email: "wolf@gmail.com",
    phone: "+49 8888888888",
    password: "mypassword123",
    login: 0,
    badge: "./assets/profilebadge/tatjana.svg",
    color: "#fc4444",
  }, {
    id: 8,
    name: "Anton Mayer",
    email: "antom@gmail.com",
    phone: "+49 1111111111",
    password: "mypassword123",
    login: 0,
    badge: "./assets/profilebadge/anton.svg",
    color:"#fc9431"
  }
], 
"tasks": [
  {
    id: 0,
    main: 'userstory',
    title: 'Kochwelt Page & Recipe Recommender',
    description: 'Build start page with recipe recommendation...',
    enddate: '2025-12-30',
    assigned: [1,3,4],   
    subtasks: [],
    priority: 'urgent',
    status: 'todo'
  },
  {
    id: 1,
    main: 'techtask',
    title: 'HTML Base Template Creation',
    description: 'Create reusable HTML base templates...',
    enddate: '2025-12-30',
    assigned: [{id:1},{id:5},{id:6}], 
    subtasks: [],
    priority: 'medium',
    status: 'inprogress'
  },
  {
    id: 2,
    main: 'userstory',
    title: 'Contact Form & Imprint',
    description: 'Create a contact form and imprint page...',
    enddate: '2025-12-30',
    assigned: [2,3],   
    subtasks: [],
    priority: 'low',
    status: 'review'
  },
  {
    id: 3,
    main: 'techtask',
    title: 'CSS Architecture Planning',
    description: 'Define CSS naming conventions and structure...',
    enddate: '2025-12-30',
    assigned: [6,2], 
    subtasks: [],
    priority: 'urgent',
    status: 'done'
  },
  {
    id: 4,
    main: 'userstory',
    title: 'Daily Kochwelt Recipe',
    description: 'Implement daily recipe and portion calculator...',
    enddate: '2025-12-30',
    assigned: [4,1,7],  
    subtasks: [],
    priority: 'urgent',
    status: 'done'
  }
]
}

if (typeof window !== "undefined") {
  window.join = join;
}