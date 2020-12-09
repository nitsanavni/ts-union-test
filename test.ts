import test from "ava";
import { command } from "execa";
import { escapeRegExp } from "lodash";
import { unlink, writeFile } from "./fs";

const typecheck = async (tsCode: string) => {
    const path = `./${Date.now()}.ts`;

    await writeFile(path, Buffer.from(tsCode));

    const { all } = await command(`npx tsc --noEmit ${path}`, { all: true, reject: false });

    await unlink(path);

    return `${all}`;
};

test.serial("scaffolding - generate and build a ts file", async (t) => {
    const tsCodeWithBuildError = `
        type A = "a";
        const b: A = "b";
    `;

    const output = await typecheck(tsCodeWithBuildError);

    t.regex(output, /error TS2322/);
    t.regex(output, /is not assignable/);
});

const givenTs = `
type Table = "t1" | "t2" | "t3";

const hasTable1 = { table: "t1" as "t1" };
const hasTable2 = { table: "t2" as "t2" };
const hasTable3 = { table: "t3" as "t3" };

const partialCollection = [hasTable1, hasTable2];
const fullCollection = [hasTable1, hasTable2, hasTable3];
`;

test.serial("using conditional-type-checks - unhelpful error message", async (t) => {
    const assertion = (collection: "partialCollection" | "fullCollection") =>
        `
        import { AssertTrue, IsExact } from "conditional-type-checks";
        type property = "table";
        type test1 = AssertTrue<IsExact<typeof ${collection}[number][property], Table>>;
        `;

    t.regex(await typecheck(givenTs + assertion("partialCollection")), /error/);
    t.notRegex(await typecheck(givenTs + assertion("fullCollection")), /error/);
});

test.serial("with meaningful error message", async (t) => {
    const assertion = (collection: "partialCollection" | "fullCollection") =>
        `
        type property = "table";
        type actual = typeof ${collection}[number][property];
        
        type Extra<T extends Table> = unknown;
        type test1 = Extra<actual>;
        type Missing<T extends actual> = unknown;
        type test2 = Missing<Table>;
        `;

    const partialCollectionResult = await typecheck(givenTs + assertion("partialCollection"));
    const fullCollectionResult = await typecheck(givenTs + assertion("fullCollection"));

    t.regex(partialCollectionResult, /does not satisfy the constraint/);
    t.regex(partialCollectionResult, new RegExp(escapeRegExp(`Type '"t3"' is not assignable to type '"t1" | "t2"'`)));
    t.notRegex(fullCollectionResult, /error/);
});
