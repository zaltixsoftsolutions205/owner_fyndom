export interface RoomSharingType {
  roomType: "Single Room" | "Double Room" | "Triple Room";
  sharingType: "2 Sharing" | "3 Sharing" | "4 Sharing";
}

export interface FacilitiesData {
  roomSharingTypes: RoomSharingType[];
  bathroomTypes: string[];
  essentials: string[];
  foodServices: string[];
}