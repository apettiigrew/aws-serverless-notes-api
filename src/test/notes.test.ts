// import { testConfig } from "./init";
import { signInAndGetIdToken } from "./given";
import { createNote } from "./when";

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
        console.log(res);
        expect(res.status).toBe(200);
        
    });
});