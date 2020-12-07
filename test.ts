import { AssertTrue, IsExact } from "conditional-type-checks";

type Table = "t1" | "t2" | "t3";
type property = "table";

// not used
interface HasTable {
    table: Table;
}

interface HasTable2<T extends Table> {
    table: T;
}

const hasTable1 = { table: "t1" as "t1" };
const hasTable2 = { table: "t2" as "t2" };
const hasTable3 = { table: "t3" as "t3" };

const hasTable21: HasTable2<"t1"> = { table: "t1" };
const hasTable22: HasTable2<"t2"> = { table: "t2" };
const hasTable23: HasTable2<"t3"> = { table: "t3" };

const partialCollection = [hasTable1, hasTable2];
const fullCollection = [hasTable1, hasTable2, hasTable3];

const partialCollection2 = [hasTable21, hasTable22];
const fullCollection2 = [hasTable21, hasTable22, hasTable23];

type test1 = AssertTrue<IsExact<typeof partialCollection[number][property], Table>>;
type test2 = AssertTrue<IsExact<typeof fullCollection[number][property], Table>>;
type test21 = AssertTrue<IsExact<typeof partialCollection2[number][property], Table>>;
type test22 = AssertTrue<IsExact<typeof fullCollection2[number][property], Table>>;
