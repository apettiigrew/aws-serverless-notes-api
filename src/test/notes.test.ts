// import { testConfig } from "./init";
import { signInAndGetIdToken } from "./given";

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
});