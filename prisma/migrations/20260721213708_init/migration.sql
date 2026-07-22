-- CreateTable
CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExampleItem" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "exampleId" TEXT NOT NULL,

    CONSTRAINT "ExampleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Example_name_key" ON "Example"("name");

-- AddForeignKey
ALTER TABLE "ExampleItem" ADD CONSTRAINT "ExampleItem_exampleId_fkey" FOREIGN KEY ("exampleId") REFERENCES "Example"("id") ON DELETE CASCADE ON UPDATE CASCADE;
