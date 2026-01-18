import { generateId } from "./uuid";

describe("UUID v7 Generation", () => {
  it("should generate a valid UUID string", () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("should generate time-sortable IDs", async () => {
    const id1 = generateId();
    await new Promise((resolve) => setTimeout(resolve, 10));
    const id2 = generateId();
    expect(id1 < id2).toBe(true);
  });
});
