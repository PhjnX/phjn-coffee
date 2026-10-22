export type Branch = {
  id: string;
  name: string;
  address: string;
  district: string;
  hours: string;
};

/** Demo branches. Phase 2 moves these into the branches table. */
export const branches: Branch[] = [
  { id: "q1", name: "Phjn Quận 1", address: "Đường Nguyễn Thái Bình", district: "Quận 1", hours: "7:00 – 22:00" },
  { id: "q3", name: "Phjn Quận 3", address: "Đường Trần Quốc Thảo", district: "Quận 3", hours: "7:00 – 22:00" },
  { id: "bt", name: "Phjn Bình Tân", address: "Đường Tên Lửa", district: "Bình Tân", hours: "6:30 – 21:30" },
];
