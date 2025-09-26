-- Clear all existing wines and populate with new data
TRUNCATE TABLE public.wines RESTART IDENTITY CASCADE;

-- Insert new wine data
INSERT INTO public.wines (
    product_id, name, producer, category, country, region, vintage,
    alcohol_percentage, price, description, sales_start_date, assortment,
    investment_score, projected_return_1y, projected_return_3y, 
    projected_return_5y, projected_return_10y, storage_time_months,
    drinking_window_start, drinking_window_end, value_appreciation
) VALUES 
('1001', 'Château Pichon Baron 2016', 'Château Pichon Baron', 'Rött vin', 'Frankrike', 'Bordeaux', 2016, 13.5, 1200.00, 'Exceptionell Bordeaux med lång lagringspotential', '2023-01-15', 'Beställningssortiment', 9, 8.5, 22.0, 45.5, 125.0, 300, 2025, 2045, 12.5),
('1002', 'Barolo Cannubi 2017', 'Paolo Scavino', 'Rött vin', 'Italien', 'Piemonte', 2017, 14.5, 890.00, 'Prestigefull Barolo från en av de bästa vingårdarna', '2023-03-01', 'Beställningssortiment', 8, 6.2, 18.8, 35.0, 78.5, 180, 2026, 2038, 8.7),
('1003', 'Chablis Grand Cru Les Clos 2020', 'Domaine Billaud-Simon', 'Vitt vin', 'Frankrike', 'Bourgogne', 2020, 13.0, 650.00, 'Grand Cru Chablis med mineralitet och elegans', '2023-04-01', 'Ordinarie sortiment', 7, 4.1, 12.5, 22.8, 45.6, 96, 2024, 2032, 5.1),
('1004', 'Champagne Krug Grande Cuvée 171ème Édition', 'Krug', 'Mousserande vin', 'Frankrike', 'Champagne', NULL, 12.0, 2400.00, 'Prestigefull champagne med komplex karaktär', '2023-12-01', 'Beställningssortiment', 10, 9.8, 25.5, 52.3, 145.8, 60, 2024, 2035, 18.2),
('1005', 'Caymus Cabernet Sauvignon 2019', 'Caymus Vineyards', 'Rött vin', 'USA', 'Napa Valley', 2019, 14.8, 780.00, 'Kraftfull Cabernet från Napa Valley', '2023-08-15', 'Beställningssortiment', 8, 5.8, 17.2, 38.7, 85.5, 180, 2025, 2035, 9.3),
('1006', 'Rioja Reserva Viña Ardanza 2015', 'La Rioja Alta', 'Rött vin', 'Spanien', 'Rioja', 2015, 13.5, 420.00, 'Klassisk Rioja med lång lagring på fat', '2023-06-01', 'Ordinarie sortiment', 7, 4.2, 12.8, 26.5, 58.2, 120, 2024, 2030, 6.8),
('1007', 'Sancerre Rouge Les Romains 2021', 'Henri Bourgeois', 'Rött vin', 'Frankrike', 'Loire', 2021, 13.0, 380.00, 'Elegant Pinot Noir från Loire', '2023-05-01', 'Ordinarie sortiment', 6, 3.5, 9.8, 18.2, 32.0, 72, 2024, 2028, 4.2),
('1008', 'Brunello di Montalcino 2017', 'Biondi-Santi', 'Rött vin', 'Italien', 'Toscana', 2017, 14.0, 1500.00, 'Legendarisk Brunello från den ursprungliga producenten', '2023-09-01', 'Beställningssortiment', 9, 7.8, 21.5, 48.2, 120.5, 240, 2027, 2045, 13.8),
('1009', 'Puligny-Montrachet Premier Cru 2020', 'Domaine Leflaive', 'Vitt vin', 'Frankrike', 'Bourgogne', 2020, 13.5, 950.00, 'Premier Cru Chardonnay av högsta kvalitet', '2023-07-01', 'Beställningssortiment', 8, 6.5, 18.2, 38.8, 82.5, 120, 2024, 2032, 10.2),
('1010', 'Hermitage Rouge 2018', 'E. Guigal', 'Rött vin', 'Frankrike', 'Rhône', 2018, 14.5, 680.00, 'Kraftfull Syrah från Hermitage', '2023-10-01', 'Ordinarie sortiment', 8, 5.2, 16.8, 34.5, 75.2, 200, 2025, 2038, 8.9),
('1011', 'Sassicaia 2018', 'Tenuta San Guido', 'Rött vin', 'Italien', 'Toscana', 2018, 14.0, 1850.00, 'Ikoniskt "Super Tuscan" vin', '2023-11-01', 'Beställningssortiment', 9, 8.2, 23.5, 51.8, 135.0, 200, 2026, 2040, 14.5),
('1012', 'Moët & Chandon Dom Pérignon 2013', 'Moët & Chandon', 'Mousserande vin', 'Frankrike', 'Champagne', 2013, 12.5, 2200.00, 'Legendarisk vintage champagne', '2023-12-15', 'Beställningssortiment', 10, 9.1, 24.8, 53.2, 142.0, 80, 2024, 2038, 16.8),
('1013', 'Riesling Spätlese Wehlener Sonnenuhr 2021', 'Joh. Jos. Prüm', 'Vitt vin', 'Tyskland', 'Mosel', 2021, 7.5, 380.00, 'Elegant tysk Riesling med mineralitet', '2023-05-15', 'Ordinarie sortiment', 6, 3.8, 10.2, 19.5, 35.8, 120, 2024, 2035, 4.8),
('1014', 'Napa Valley Cabernet Sauvignon 2019', 'Screaming Eagle', 'Rött vin', 'USA', 'Napa Valley', 2019, 15.0, 4500.00, 'Kultigt vin från Napa Valley', '2023-09-15', 'Beställningssortiment', 10, 10.5, 28.0, 62.5, 180.0, 240, 2027, 2045, 18.5),
('1015', 'Gevrey-Chambertin Premier Cru 2019', 'Domaine Armand Rousseau', 'Rött vin', 'Frankrike', 'Bourgogne', 2019, 13.5, 1200.00, 'Premier Cru Pinot Noir från Bourgogne', '2023-08-01', 'Beställningssortiment', 8, 6.8, 19.2, 42.5, 95.0, 180, 2025, 2040, 11.8);