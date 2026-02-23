// import { testConfig } from "./init";
import { signInAndGetIdToken } from "./given";
import { createNote, updateNote } from "./when";

// beforeAll(async () => {
//     await testConfig();
// });
let idToken: string;
describe("Given an authenticated user", () => {
    beforeAll(async () => {
        idToken = await signInAndGetIdToken();
        expect(idToken).toBeDefined();
    });

    it("obtains an id token", async () => {
        expect(idToken).toBeDefined();
    });

    it("can create a note", async () => {
        const res = await createNote("Test note", idToken);
        // console.log(res);
        expect(res.status).toBe(200);
    });

    it("can update a note", async () => {
        const createRes = await createNote("Original note", idToken);
        expect(createRes.status).toBe(200);
        const created = (await createRes.json()) as { id: string; name: string };
        expect(created.id).toBeDefined();

        console.log(created);
        console.log(idToken);
        const updateRes = await updateNote(created.id, "Updated note", idToken);
        console.log(updateRes);
        expect(updateRes.status).toBe(200);
        // const updated = (await updateRes.json()) as { id: string; name: string };
        // expect(updated.name).toBe("Updated note");
        // expect(updated.id).toBe(created.id);
    });
});