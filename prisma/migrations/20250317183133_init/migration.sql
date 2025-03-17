BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Cliente] (
    [clienteId] BIGINT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [identidad] NVARCHAR(255) NOT NULL,
    CONSTRAINT [Cliente_pkey] PRIMARY KEY CLUSTERED ([clienteId])
);

-- CreateTable
CREATE TABLE [dbo].[Orden] (
    [ordenId] BIGINT NOT NULL IDENTITY(1,1),
    [clienteId] BIGINT NOT NULL,
    [impuesto] DECIMAL(10,2) NOT NULL,
    [subtotal] DECIMAL(10,2) NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    CONSTRAINT [Orden_pkey] PRIMARY KEY CLUSTERED ([ordenId])
);

-- CreateTable
CREATE TABLE [dbo].[DetalleOrden] (
    [detalleOrdenId] BIGINT NOT NULL IDENTITY(1,1),
    [ordenId] BIGINT NOT NULL,
    [productoId] BIGINT NOT NULL,
    [cantidad] DECIMAL(10,2) NOT NULL,
    [impuesto] DECIMAL(10,2) NOT NULL,
    [subtotal] DECIMAL(10,2) NOT NULL,
    [total] DECIMAL(10,2) NOT NULL,
    CONSTRAINT [DetalleOrden_pkey] PRIMARY KEY CLUSTERED ([detalleOrdenId])
);

-- CreateTable
CREATE TABLE [dbo].[Producto] (
    [productoId] BIGINT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(255) NOT NULL,
    [descripcion] NVARCHAR(255),
    [precio] DECIMAL(10,2) NOT NULL,
    [existencia] BIGINT NOT NULL,
    CONSTRAINT [Producto_pkey] PRIMARY KEY CLUSTERED ([productoId])
);

-- AddForeignKey
ALTER TABLE [dbo].[Orden] ADD CONSTRAINT [Orden_clienteId_fkey] FOREIGN KEY ([clienteId]) REFERENCES [dbo].[Cliente]([clienteId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DetalleOrden] ADD CONSTRAINT [DetalleOrden_ordenId_fkey] FOREIGN KEY ([ordenId]) REFERENCES [dbo].[Orden]([ordenId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DetalleOrden] ADD CONSTRAINT [DetalleOrden_productoId_fkey] FOREIGN KEY ([productoId]) REFERENCES [dbo].[Producto]([productoId]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
