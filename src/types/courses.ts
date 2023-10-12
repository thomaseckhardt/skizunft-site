type Course = {
  id: string;
  startDate: Date;
  endDate: Date;
};

type Discipline = "Ski" | "Snowboard";

type Category = {
  id: string;
  discipline: Discipline;
  title: string;
  description: string;
  times: string;
  minAge: number;
  maxAge: number;
  price: number;
  priceMembers: number;
  skillLevels: SkillLevel[];
  meetingPoint: MeetingPoint;
};

type SkillLevel = {
  id: string;
  title: string;
  meetingPoint: MeetingPoint;
};

type MeetingPoint = {
  id: string;
  title: string;
};
