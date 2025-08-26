
const profileButton = document.getElementById('profileButton');
const profileDropdown = document.getElementById('profileDropdown');
const teamsGrid = document.getElementById('teamsGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const userNameElement = document.getElementById('userName');

// Toggle dropdown visibility
profileButton.addEventListener('click', (event) => {
    event.stopPropagation();
    profileDropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    if (!profileDropdown.contains(event.target) && !profileButton.contains(event.target)) {
        profileDropdown.classList.remove('show');
    }
});

// Demo user data
const demoUser = {
    id: "EMP001",
    firstName: "John",
    lastName: "Parker",
    fullName: "John Parker",
    email: "john.parker@wordlane.com",
    role: "Senior Developer",
    department: "Development",
    avatar: "https://placehold.co/48x48/CCCCCC/FFFFFF?text=JP"
};

// Function to fetch user data and update welcome message
async function fetchUserData() {
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Use demo data instead of API call
        const userData = demoUser;
        
        // Update welcome message with user's first name
        if (userNameElement) {
            userNameElement.textContent = userData.firstName;
            
            // Add a subtle animation effect
            userNameElement.style.opacity = '0';
            userNameElement.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                userNameElement.style.transition = 'all 0.5s ease';
                userNameElement.style.opacity = '1';
                userNameElement.style.transform = 'translateY(0)';
            }, 100);
        }

        // Update profile picture and name in header
        const profileImg = document.querySelector('.profile-picture img');
        const profileName = document.querySelector('.profile-name');
        
        if (profileImg) {
            profileImg.src = userData.avatar;
            profileImg.alt = userData.fullName;
        }
        
        if (profileName) {
            profileName.textContent = userData.fullName;
        }

    } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to default name
        if (userNameElement) {
            userNameElement.textContent = 'John';
        }
    }
}

// Demo data for teams
const demoTeams = [
    {
        id: "TEAM001",
        name: "Development Team Alpha",
        description: "Core development team working on the main product platform and new features.",
        lead: "Sarah Johnson",
        members: [
            {
                name: "Sarah Johnson",
                role: "Team Lead",
                avatar: "https://placehold.co/60x60/4F46E5/FFFFFF?text=SJ",
                status: "online",
                email: "sarah.johnson@wordlane.com"
            },
            {
                name: "John Parker",
                role: "Senior Developer",
                avatar: "https://placehold.co/60x60/0EA5E9/FFFFFF?text=JP",
                status: "online",
                email: "john.parker@wordlane.com"
            },
            {
                name: "Mike Chen",
                role: "Frontend Developer",
                avatar: "https://placehold.co/60x60/10B981/FFFFFF?text=MC",
                status: "busy",
                email: "mike.chen@wordlane.com"
            },
            {
                name: "Emily Davis",
                role: "Backend Developer",
                avatar: "https://placehold.co/60x60/F59E0B/FFFFFF?text=ED",
                status: "offline",
                email: "emily.davis@wordlane.com"
            }
        ],
        projects: ["E-Commerce Platform", "Mobile App"],
        activeMembers: 3,
        totalMembers: 4
    },
    {
        id: "TEAM002",
        name: "Design & UX Team",
        description: "Creative team responsible for user experience design and visual assets.",
        lead: "Alex Rodriguez",
        members: [
            {
                name: "Alex Rodriguez",
                role: "Design Lead",
                avatar: "https://placehold.co/60x60/EF4444/FFFFFF?text=AR",
                status: "online",
                email: "alex.rodriguez@wordlane.com"
            },
            {
                name: "Rachel Green",
                role: "UI/UX Designer",
                avatar: "https://placehold.co/60x60/8B5CF6/FFFFFF?text=RG",
                status: "online",
                email: "rachel.green@wordlane.com"
            },
            {
                name: "Tom Anderson",
                role: "Graphic Designer",
                avatar: "https://placehold.co/60x60/EC4899/FFFFFF?text=TA",
                status: "offline",
                email: "tom.anderson@wordlane.com"
            }
        ],
        projects: ["Website Redesign", "Brand Guidelines"],
        activeMembers: 2,
        totalMembers: 3
    },
    {
        id: "TEAM003",
        name: "QA & Testing Team",
        description: "Quality assurance team ensuring product reliability and performance.",
        lead: "David Wilson",
        members: [
            {
                name: "David Wilson",
                role: "QA Lead",
                avatar: "https://placehold.co/60x60/06B6D4/FFFFFF?text=DW",
                status: "online",
                email: "david.wilson@wordlane.com"
            },
            {
                name: "Lisa Thompson",
                role: "Test Engineer",
                avatar: "https://placehold.co/60x60/84CC16/FFFFFF?text=LT",
                status: "busy",
                email: "lisa.thompson@wordlane.com"
            },
            {
                name: "Kevin Martinez",
                role: "Automation Engineer",
                avatar: "https://placehold.co/60x60/F97316/FFFFFF?text=KM",
                status: "online",
                email: "kevin.martinez@wordlane.com"
            },
            {
                name: "Amanda White",
                role: "Performance Tester",
                avatar: "https://placehold.co/60x60/6366F1/FFFFFF?text=AW",
                status: "offline",
                email: "amanda.white@wordlane.com"
            },
            {
                name: "Chris Lee",
                role: "Security Tester",
                avatar: "https://placehold.co/60x60/14B8A6/FFFFFF?text=CL",
                status: "online",
                email: "chris.lee@wordlane.com"
            }
        ],
        projects: ["Security Audit", "Performance Testing"],
        activeMembers: 3,
        totalMembers: 5
    }
];

// Function to create a team card
function createTeamCard(team) {
    const membersHtml = team.members.map(member => `
        <div class="member-card">
            <img src="${member.avatar}" alt="${member.name}" class="member-avatar">
            <div class="member-info">
                <h3>${member.name}</h3>
                <p class="member-role">${member.role}</p>
                <span class="member-status status-${member.status}">${member.status}</span>
            </div>
            <div class="member-actions">
                <a href="#" class="action-btn" onclick="sendMessage('${member.email}')" title="Send Message">
                    <i class="fas fa-comment"></i>
                </a>
                <a href="#" class="action-btn" onclick="viewProfile('${member.email}')" title="View Profile">
                    <i class="fas fa-user"></i>
                </a>
            </div>
        </div>
    `).join('');

    return `
        <div class="team-card">
            <h3>${team.name}</h3>
            <p>${team.description}</p>
            
            <div class="team-info">
                <div class="info-item">
                    <span class="info-label">Team Lead</span>
                    <span class="info-value">${team.lead}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Members</span>
                    <span class="info-value">${team.activeMembers}/${team.totalMembers} active</span>
                </div>
            </div>
            
            <div class="team-actions">
                <a href="#" class="action-btn" onclick="viewTeamDetails('${team.id}')" title="Team Details">
                    <i class="fas fa-users"></i>
                </a>
                <a href="#" class="action-btn" onclick="scheduleMeeting('${team.id}')" title="Schedule Meeting">
                    <i class="fas fa-calendar-plus"></i>
                </a>
                <a href="#" class="action-btn" onclick="teamChat('${team.id}')" title="Team Chat">
                    <i class="fas fa-comments"></i>
                </a>
            </div>
            
            <div class="mt-6">
                <h4 class="text-lg font-semibold text-gray-800 mb-4">Team Members</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${membersHtml}
                </div>
            </div>
        </div>
    `;
}

// Function to send message
function sendMessage(email) {
    console.log('Sending message to:', email);
    // Implement messaging functionality
}

// Function to view profile
function viewProfile(email) {
    console.log('Viewing profile for:', email);
    // Implement profile view functionality
}

// Function to view team details
function viewTeamDetails(teamId) {
    console.log('Viewing team details for:', teamId);
    // Implement team details view
}

// Function to schedule meeting
function scheduleMeeting(teamId) {
    console.log('Scheduling meeting for team:', teamId);
    // Implement meeting scheduling
}

// Function to open team chat
function teamChat(teamId) {
    console.log('Opening team chat for:', teamId);
    // Implement team chat functionality
}

// Function to fetch and display teams
async function fetchEmployeeTeamsData() {
    try {
        // Show loading state
        loadingState.classList.remove('hidden');
        errorState.classList.add('hidden');
        teamsGrid.innerHTML = '';

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Use demo data instead of API call
        const teams = demoTeams;
        
        // Hide loading state
        loadingState.classList.add('hidden');
        
        // Display teams
        teams.forEach(team => {
            teamsGrid.insertAdjacentHTML('beforeend', createTeamCard(team));
        });
        
    } catch (error) {
        console.error('Error fetching employee teams data:', error);
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch user data first
    await fetchUserData();
    // Then fetch teams data
    await fetchEmployeeTeamsData();
});
