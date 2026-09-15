import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB, { closeDB } from '../config/db.js';

import User from '../models/User.js';
import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';
import Appointment from '../models/Appointment.js';
import Announcement from '../models/Announcement.js';
import Event from '../models/Event.js';
import LostFound from '../models/LostFound.js';
import Skill from '../models/Skill.js';
import HelpRequest from '../models/HelpRequest.js';
import Notification from '../models/Notification.js';
import Feedback from '../models/Feedback.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing previous collections...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Complaint.deleteMany({});
    await Appointment.deleteMany({});
    await Announcement.deleteMany({});
    await Event.deleteMany({});
    await LostFound.deleteMany({});
    await Skill.deleteMany({});
    await HelpRequest.deleteMany({});
    await Notification.deleteMany({});
    await Feedback.deleteMany({});

    console.log('[Seeder] Creating Departments...');
    const departments = await Department.create([
      {
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Department of Computer Science, Software Engineering and AI',
        contactEmail: 'cse-dept@university.edu',
        officeLocation: 'Academic Block A, 3rd Floor',
      },
      {
        name: 'Electronics & Communication Engineering',
        code: 'ECE',
        description: 'Department of VLSI, Embedded Systems and Communications',
        contactEmail: 'ece-dept@university.edu',
        officeLocation: 'Academic Block B, 2nd Floor',
      },
      {
        name: 'Mechanical Engineering',
        code: 'ME',
        description: 'Department of Robotics, Mechanics and Design',
        contactEmail: 'me-dept@university.edu',
        officeLocation: 'Workshop Complex, Wing 1',
      },
      {
        name: 'Campus Operations & Student Affairs',
        code: 'COSA',
        description: 'Hostel, Infrastructure, Mess and Campus Facilities Administration',
        contactEmail: 'operations@university.edu',
        officeLocation: 'Administrative Block, Ground Floor',
      },
    ]);

    const [cseDept, eceDept, meDept, cosaDept] = departments;

    console.log('[Seeder] Creating Users (Admin, Faculty, Students)...');
    // Admin
    const admin = await User.create({
      name: 'Campus Administrator',
      email: 'admin@university.edu',
      password: 'password123',
      role: 'admin',
      identifier: 'ADMIN-001',
      phone: '+91 9876543210',
      bio: 'Central Academic & Campus Operations Administrator',
    });

    // Faculty members
    const drSharma = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh.sharma@university.edu',
      password: 'password123',
      role: 'faculty',
      department: cseDept._id,
      identifier: 'FAC-CSE-01',
      phone: '+91 9876543211',
      bio: 'Professor & Head of Computer Science. Research: Distributed Systems & Machine Learning.',
    });

    const profPatel = await User.create({
      name: 'Prof. Priya Patel',
      email: 'priya.patel@university.edu',
      password: 'password123',
      role: 'faculty',
      department: eceDept._id,
      identifier: 'FAC-ECE-02',
      phone: '+91 9876543212',
      bio: 'Associate Professor, Embedded Systems and IoT Architectures.',
    });

    const drRao = await User.create({
      name: 'Dr. Vikram Rao',
      email: 'vikram.rao@university.edu',
      password: 'password123',
      role: 'faculty',
      department: cosaDept._id,
      identifier: 'FAC-OPS-03',
      phone: '+91 9876543213',
      bio: 'Chief Warden & Officer-in-charge of Student Grievances & Hostel Affairs.',
    });

    // Link HODs
    cseDept.headOfDepartment = drSharma._id;
    await cseDept.save();
    eceDept.headOfDepartment = profPatel._id;
    await eceDept.save();
    cosaDept.headOfDepartment = drRao._id;
    await cosaDept.save();

    // Students
    const aarav = await User.create({
      name: 'Aarav Sharma',
      email: 'student@university.edu', // Primary demo student
      password: 'password123',
      role: 'student',
      department: cseDept._id,
      identifier: '2023CS101',
      phone: '+91 9123456780',
      bio: 'Senior Year CS Undergrad | Full-stack enthusiast & competitive coder',
    });

    const diya = await User.create({
      name: 'Diya Verma',
      email: 'diya.verma@student.university.edu',
      password: 'password123',
      role: 'student',
      department: cseDept._id,
      identifier: '2023CS102',
      phone: '+91 9123456781',
      bio: 'UI/UX Designer and Frontend Specialist. IEEE Student Branch Lead.',
    });

    const rohan = await User.create({
      name: 'Rohan Gupta',
      email: 'rohan.gupta@student.university.edu',
      password: 'password123',
      role: 'student',
      department: eceDept._id,
      identifier: '2023EC201',
      phone: '+91 9123456782',
      bio: 'ECE junior focusing on Arduino robotics and embedded firmware.',
    });

    console.log('[Seeder] Creating Complaints across 5 Lifecycle Stages...');
    await Complaint.create([
      {
        title: 'Wi-Fi connectivity fluctuating in Computer Lab 3',
        description: 'The access point in Lab 3 drops connections every 10 minutes during practical sessions.',
        category: 'IT/Network',
        priority: 'High',
        status: 'Pending',
        submittedBy: aarav._id,
        department: cseDept._id,
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: aarav._id,
            note: 'Complaint registered by student',
            timestamp: new Date(Date.now() - 3 * 86400000),
          },
        ],
      },
      {
        title: 'Hostel Block B 3rd Floor Water Purifier Leaking',
        description: 'Water has pooled in the corridor near room 312 due to a leaking RO dispenser valve.',
        category: 'Hostel',
        priority: 'Urgent',
        status: 'Assigned',
        submittedBy: diya._id,
        department: cosaDept._id,
        assignedTo: drRao._id,
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: diya._id,
            note: 'Complaint registered by student',
            timestamp: new Date(Date.now() - 2 * 86400000),
          },
          {
            status: 'Assigned',
            updatedBy: admin._id,
            note: 'Assigned to Campus Operations Officer for urgent plumbing service dispatch.',
            timestamp: new Date(Date.now() - 1 * 86400000),
          },
        ],
      },
      {
        title: 'Air conditioning malfunction in Seminar Hall A',
        description: 'Compressor is making loud noise and not cooling. Capstone presentations scheduled here.',
        category: 'Infrastructure',
        priority: 'Medium',
        status: 'In Progress',
        submittedBy: aarav._id,
        department: cosaDept._id,
        assignedTo: drRao._id,
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: aarav._id,
            note: 'Initial report submitted',
            timestamp: new Date(Date.now() - 4 * 86400000),
          },
          {
            status: 'Assigned',
            updatedBy: admin._id,
            note: 'Assigned to maintenance technician team',
            timestamp: new Date(Date.now() - 3 * 86400000),
          },
          {
            status: 'In Progress',
            updatedBy: drRao._id,
            note: 'Technicians on site replacing compressor capacitor.',
            timestamp: new Date(Date.now() - 1 * 86400000),
          },
        ],
      },
      {
        title: 'Library Reference Section lighting too dim',
        description: 'LED panels near the engineering reference racks are flickering.',
        category: 'Library',
        priority: 'Low',
        status: 'Resolved',
        submittedBy: rohan._id,
        department: cosaDept._id,
        assignedTo: drRao._id,
        resolutionNotes: 'Replaced 4 overhead 24W LED fixtures. Lumens measured and verified optimal.',
        resolvedAt: new Date(Date.now() - 12 * 3600000),
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: rohan._id,
            note: 'Complaint submitted',
            timestamp: new Date(Date.now() - 5 * 86400000),
          },
          {
            status: 'Assigned',
            updatedBy: admin._id,
            note: 'Assigned to Electrical maintenance',
            timestamp: new Date(Date.now() - 4 * 86400000),
          },
          {
            status: 'In Progress',
            updatedBy: drRao._id,
            note: 'Fixture replacements procured',
            timestamp: new Date(Date.now() - 2 * 86400000),
          },
          {
            status: 'Resolved',
            updatedBy: drRao._id,
            note: 'New high-efficiency fixtures installed.',
            timestamp: new Date(Date.now() - 12 * 3600000),
          },
        ],
      },
      {
        title: 'Mess Cafeteria evening breakfast timing extension',
        description: 'Request to extend evening snack window by 30 minutes for sports participants.',
        category: 'Mess/Cafeteria',
        priority: 'Medium',
        status: 'Confirmed',
        submittedBy: aarav._id,
        department: cosaDept._id,
        assignedTo: drRao._id,
        resolutionNotes: 'Evening mess timings adjusted to 5:00 PM – 6:45 PM daily.',
        resolvedAt: new Date(Date.now() - 6 * 86400000),
        confirmedAt: new Date(Date.now() - 5 * 86400000),
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: aarav._id,
            note: 'Request filed',
            timestamp: new Date(Date.now() - 10 * 86400000),
          },
          {
            status: 'Assigned',
            updatedBy: admin._id,
            note: 'Passed to Mess Committee',
            timestamp: new Date(Date.now() - 9 * 86400000),
          },
          {
            status: 'In Progress',
            updatedBy: drRao._id,
            note: 'Reviewed with student council',
            timestamp: new Date(Date.now() - 8 * 86400000),
          },
          {
            status: 'Resolved',
            updatedBy: drRao._id,
            note: 'Timings adjusted and circular issued',
            timestamp: new Date(Date.now() - 6 * 86400000),
          },
          {
            status: 'Confirmed',
            updatedBy: aarav._id,
            note: 'Timings active and convenient. Confirmed closure.',
            timestamp: new Date(Date.now() - 5 * 86400000),
          },
        ],
      },
    ]);

    console.log('[Seeder] Creating Faculty Appointment Slots...');
    const today = new Date();
    const getDateStr = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    await Appointment.create([
      {
        faculty: drSharma._id,
        date: getDateStr(1),
        startTime: '10:00',
        endTime: '10:30',
        meetingLocation: 'Cabin 304, CS Block',
        status: 'Available',
      },
      {
        faculty: drSharma._id,
        date: getDateStr(1),
        startTime: '11:00',
        endTime: '11:30',
        meetingLocation: 'Cabin 304, CS Block',
        status: 'Requested',
        student: aarav._id,
        purpose: 'Capstone project progress consultation and architecture review.',
      },
      {
        faculty: drSharma._id,
        date: getDateStr(2),
        startTime: '14:00',
        endTime: '14:30',
        meetingLocation: 'Google Meet / Online',
        status: 'Accepted',
        student: diya._id,
        purpose: 'Research paper discussion on edge computing.',
        facultyNotes: 'Please review section 3 before the meeting.',
      },
      {
        faculty: profPatel._id,
        date: getDateStr(1),
        startTime: '15:00',
        endTime: '15:30',
        meetingLocation: 'Lab 201, ECE Block',
        status: 'Available',
      },
      {
        faculty: profPatel._id,
        date: getDateStr(3),
        startTime: '16:00',
        endTime: '16:30',
        meetingLocation: 'Cabin 112, ECE Block',
        status: 'Available',
      },
    ]);

    console.log('[Seeder] Creating Campus Announcements...');
    await Announcement.create([
      {
        title: 'Mid-Semester Examinations Timetable Released',
        content: 'The official schedule for Autumn 2026 mid-term evaluations is now published. Students may download their personalized hall tickets from the academic portal.',
        category: 'Examination',
        priority: 'Important',
        targetAudience: 'All',
        department: null,
        author: admin._id,
        isPinned: true,
      },
      {
        title: 'Emergency Server Maintenance Scheduled Tonight',
        content: 'Campus network gateways and proxy authentication servers will undergo crucial firmware patches between 02:00 AM and 04:00 AM IST.',
        category: 'Urgent Alert',
        priority: 'Urgent',
        targetAudience: 'All',
        department: null,
        author: admin._id,
        isPinned: true,
      },
      {
        title: 'Annual Tech Symposium: HackSphere 2026 Announced',
        content: 'Registrations are now open for 36-hour inter-college hackathon HackSphere. Exciting cash prizes, cloud credits, and placement interviews for top teams.',
        category: 'Event',
        priority: 'Normal',
        targetAudience: 'Student',
        department: cseDept._id,
        author: drSharma._id,
        isPinned: false,
      },
    ]);

    console.log('[Seeder] Creating Events with Capacities & Registrations...');
    await Event.create([
      {
        title: 'Next-Gen Full Stack & AI Workshop',
        description: 'Hands-on intensive workshop exploring modern web architecture, microservices, and practical integration of Large Language Models.',
        category: 'Workshop',
        venue: 'Auditorium Hall B',
        startDate: new Date(Date.now() + 5 * 86400000),
        endDate: new Date(Date.now() + 5 * 86400000 + 4 * 3600000),
        capacity: 60,
        organizer: drSharma._id,
        department: cseDept._id,
        registeredStudents: [
          { student: aarav._id, registeredAt: new Date() },
          { student: diya._id, registeredAt: new Date() },
        ],
      },
      {
        title: 'VLSI Circuit Design & IoT Masterclass',
        description: 'Guest lecture from leading semiconductor industry experts on RISC-V architectures and embedded sensor networks.',
        category: 'Seminar',
        venue: 'ECE Seminar Hall 2',
        startDate: new Date(Date.now() + 8 * 86400000),
        endDate: new Date(Date.now() + 8 * 86400000 + 3 * 3600000),
        capacity: 40,
        organizer: profPatel._id,
        department: eceDept._id,
        registeredStudents: [
          { student: rohan._id, registeredAt: new Date() },
        ],
      },
      {
        title: 'Inter-Departmental Football Championship',
        description: 'Annual autumn football tournament. League stage matches begin this Friday.',
        category: 'Sports',
        venue: 'Main Sports Complex Stadium',
        startDate: new Date(Date.now() + 3 * 86400000),
        endDate: new Date(Date.now() + 7 * 86400000),
        capacity: 120,
        organizer: admin._id,
        department: null,
        registeredStudents: [],
      },
    ]);

    console.log('[Seeder] Creating Lost & Found Items...');
    await LostFound.create([
      {
        type: 'Lost',
        title: 'Dark Blue Dell XPS 15 Laptop Charger',
        description: '65W USB Type-C charger forgotten near desk 14 on the 2nd floor of Central Library.',
        category: 'Electronics',
        location: 'Central Library 2nd Floor',
        date: new Date(Date.now() - 1 * 86400000),
        postedBy: aarav._id,
        contactPhone: '+91 9123456780',
        status: 'Open',
      },
      {
        type: 'Found',
        title: 'Casio Scientific Calculator fx-991CW',
        description: 'Black scientific calculator left on the lab table after ECE Microcontroller lab.',
        category: 'Electronics',
        location: 'Block B Lab 203',
        date: new Date(Date.now() - 2 * 86400000),
        postedBy: rohan._id,
        contactPhone: '+91 9123456782',
        status: 'Open',
      },
      {
        type: 'Found',
        title: 'Student ID Card & Dorm Key Ring',
        description: 'Found on the pathway between Mess 2 and Hostel Block C. Kept with security guard.',
        category: 'ID Cards/Wallets',
        location: 'Pathway near Mess 2',
        date: new Date(Date.now() - 4 * 86400000),
        postedBy: diya._id,
        status: 'Resolved',
        resolvedBy: admin._id,
        resolvedAt: new Date(Date.now() - 2 * 86400000),
        resolutionNote: 'Claimed by student after verifying registration number at admin desk.',
      },
    ]);

    console.log('[Seeder] Creating Skills & Help Requests...');
    await Skill.create([
      {
        user: aarav._id,
        skillName: 'React.js & Node.js',
        category: 'Programming',
        proficiencyLevel: 'Expert',
        availability: 'Weekdays after 6 PM',
        description: 'Can guide in full stack web development, REST API design, and frontend state management.',
      },
      {
        user: aarav._id,
        skillName: 'Data Structures & Algorithms',
        category: 'Academics',
        proficiencyLevel: 'Advanced',
        availability: 'Saturday mornings',
        description: 'Experienced in Leetcode patterns, Dynamic Programming, and Graph algorithms.',
      },
      {
        user: diya._id,
        skillName: 'Figma & UI Design',
        category: 'Design & UI',
        proficiencyLevel: 'Expert',
        availability: 'Weekends',
        description: 'Can help teams create high-fidelity prototypes and design systems.',
      },
      {
        user: rohan._id,
        skillName: 'Embedded C & Arduino',
        category: 'Electronics',
        proficiencyLevel: 'Advanced',
        availability: 'Evenings',
        description: 'Assisting peers in microcontroller interfacing and sensor circuits.',
      },
    ]);

    await HelpRequest.create([
      {
        title: 'Assistance with MongoDB Aggregation Pipeline',
        description: 'Stuck with grouping multi-level array references in my database project. Need guidance.',
        category: 'Programming',
        skillNeeded: 'React.js & Node.js',
        student: diya._id,
        urgency: 'Medium',
        status: 'Open',
      },
      {
        title: 'Guidance on Fourier Transforms in Signal Processing',
        description: 'Looking for peer study partner to solve past year mid-term questions for Signals & Systems.',
        category: 'Mathematics',
        skillNeeded: 'Academics',
        student: rohan._id,
        urgency: 'High',
        status: 'Accepted',
        acceptedBy: aarav._id,
        acceptedAt: new Date(),
      },
    ]);

    console.log('[Seeder] Creating Notifications...');
    await Notification.create([
      {
        recipient: aarav._id,
        sender: drSharma._id,
        title: 'Appointment Request Received',
        message: 'Dr. Rajesh Sharma has received your consultation booking request.',
        type: 'Appointment',
        link: '/student/appointments',
        isRead: false,
      },
      {
        recipient: aarav._id,
        sender: admin._id,
        title: 'Complaint Logged Successfully',
        message: 'Your grievance #IT-LAB3 has been recorded and submitted for administrator review.',
        type: 'Complaint',
        link: '/student/complaints',
        isRead: true,
      },
    ]);

    console.log('[Seeder] Creating Platform Feedback...');
    await Feedback.create([
      {
        user: aarav._id,
        rating: 5,
        category: 'Platform Experience',
        comment: 'The streamlined complaint tracking and appointment scheduler makes campus life so much easier!',
        status: 'Reviewed',
      },
      {
        user: diya._id,
        rating: 4,
        category: 'Campus Facilities',
        comment: 'App is very responsive. Glad that hostel issues now have accountable timelines and audit logs.',
        status: 'Reviewed',
      },
      {
        user: rohan._id,
        rating: 5,
        category: 'Events & Activities',
        comment: 'Great event registration experience. No more queueing outside the department office for tokens.',
        status: 'Reviewed',
      },
    ]);

    console.log('----------------------------------------------------');
    console.log('[Seeder] Database Seeded Successfully!');
    console.log('DEMO ACCOUNTS CREATED:');
    console.log('1. Admin:   email: admin@university.edu         password: password123');
    console.log('2. Faculty: email: rajesh.sharma@university.edu password: password123');
    console.log('3. Student: email: student@university.edu       password: password123');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('[Seeder Error]:', err);
  } finally {
    if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
      await closeDB();
      process.exit(0);
    }
  }
};

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase();
}
