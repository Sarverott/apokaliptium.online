export interface Chapter {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  stamp?: string;
}

export interface CastMember {
  name: string;
  role: string;
}

export interface TimelineStep {
  title: string;
  desc: string;
  label: string;
  positionPercent: number;
}
