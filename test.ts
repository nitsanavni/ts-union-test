import test from "ava";
import { command } from "execa";
import * as fs from "fs";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const buildTsc = async (tsCode: string) => {
    const path = `./${Date.now()}`;
    await writeFile(`${path}.ts`, Buffer.from(tsCode));
    const { all } = await command(`npx tsc ${path}.ts`, { all: true, reject: false });

    await unlink(`${path}.ts`);
    await unlink(`${path}.js`);

    return `${all}`;
};

test.serial("scaffolding - generate and build a ts file", async (t) => {
    const tsCodeWithBuildError = `
        type A = "a";
        const b: A = "b";
    `;

    const output = await buildTsc(tsCodeWithBuildError);

    t.regex(output, /error TS2322/);
    t.regex(output, /is not assignable/);
});

test.serial("our case", async (t) => {
    const givenTs = `
    type Table = "t1" | "t2" | "t3";

    const hasTable1 = { table: "t1" as "t1" };
    const hasTable2 = { table: "t2" as "t2" };
    const hasTable3 = { table: "t3" as "t3" };

    const partialCollection = [hasTable1, hasTable2];
    const fullCollection = [hasTable1, hasTable2, hasTable3];
    `;

    const assertion = (collection: "partialCollection" | "fullCollection") =>
        `
        import { AssertTrue, IsExact } from "conditional-type-checks";
        type property = "table";
        type test1 = AssertTrue<IsExact<typeof ${collection}[number][property], Table>>;
        `;

    t.regex(await buildTsc(givenTs + assertion("partialCollection")), /error/);
    t.notRegex(await buildTsc(givenTs + assertion("fullCollection")), /error/);
});

test.todo("with meaningful error messages");
