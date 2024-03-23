export interface Room {
  id: string;
  name: string;
  issue: string;
  card_options: string;
  show_cards: boolean;
  created_at: number;
  owner_uid: string;
  room_passcode: string | null;
}
