import { Assert, AssertTrue, IsExact } from "conditional-type-checks";

type Table = "t1" | "t2" | "t3";
type property = "table";

interface HasTable {
    table: Table;
}

const hasTable1 = { table: "t1" as const };
const hasTable2 = { table: "t2" as const };
const hasTable3 = { table: "t3" as const };

const partialCollection = [hasTable1, hasTable2];
const fullCollection = [hasTable1, hasTable2, hasTable3];

type test1 = AssertTrue<IsExact<typeof partialCollection[number][property], Table>>;
type test2 = AssertTrue<IsExact<typeof fullCollection[number][property], Table>>;
