import { NextResponse } from "next/server";

const userData = {
  user_id: "1",
  firstName: "Владимир",
  lastName: "Ospanova",
  email: "aru.ospanova@gmail.com",
  gender: "Female",
  phone: "+77771234567",
  nationality: "Kazakh",
  currentAddress: "Astana, Kazakhstan",
  avatar_url: "/profile-pic.jpg",
  bookingMessage:
    "I'm looking for a quiet place near the university campus with good public transport connections.",
  studyOrWork: "Study",
  studyingAt: "Astana IT University",
  fundingSource: "Scholarship and family support",
  bio: "Computer Science student passionate about web development and UX design. I enjoy quiet environments for studying and I'm a clean and organized roommate.",
  documents: [
    { id: 1, name: "ID Card", url: "/documents/id-card.pdf" },
    { id: 2, name: "Student Card", url: "/documents/student-card.pdf" },
  ],
  notificationPreferences: {
    sms: true,
    email: true,
    phone: false,
  },
  dateOfBirth: "2002-03-15",
  preferredLanguage: "English",
  emergencyContact: "+77001234567",
  roomPreferences: "Quiet environment, non-smoking",
  arrivalDate: "2025-08-15",
  profileStatus: "Complete",
};

export async function GET() {
  // Simulate delay like a real API
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({ data: userData });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    // In a real implementation, we would update the database
    // Here we just merge the updates with our mock data
    Object.assign(userData, body);

    return NextResponse.json({
      message: "Profile updated successfully",
      data: userData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 400 },
    );
  }
}