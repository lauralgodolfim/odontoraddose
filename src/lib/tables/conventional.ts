/**
 * Conventional radiography reference doses.
 * Source: doses sheet rows 28-41 — IN 90/2021 Annex II (maximum permitted ESD).
 *
 * `thicknessCm` is the standard adult anatomical thickness used by the
 * spreadsheet for the geometric correction. `maxEsdMgy` is the maximum
 * permitted entrance skin dose (mGy) for that exam.
 */
export type ConventionalExam = {
	slug: string;
	label: string;
	thicknessCm: number;
	maxEsdMgy: number;
};

export const conventionalExams: ConventionalExam[] = [
	{
		slug: "lumbar-ap",
		label: "Lumbar spine AP",
		thicknessCm: 23,
		maxEsdMgy: 10,
	},
	{
		slug: "lumbar-lat",
		label: "Lumbar spine LAT",
		thicknessCm: 30,
		maxEsdMgy: 30,
	},
	{
		slug: "lumbar-lsj",
		label: "Lumbar spine LSJ",
		thicknessCm: 20,
		maxEsdMgy: 40,
	},
	{ slug: "abdomen-ap", label: "Abdomen AP", thicknessCm: 23, maxEsdMgy: 10 },
	{
		slug: "urography-ap",
		label: "Urography AP",
		thicknessCm: 23,
		maxEsdMgy: 10,
	},
	{
		slug: "cholecystography-ap",
		label: "Cholecystography AP",
		thicknessCm: 23,
		maxEsdMgy: 10,
	},
	{ slug: "pelvis-ap", label: "Pelvis AP", thicknessCm: 23, maxEsdMgy: 10 },
	{ slug: "hip-ap", label: "Hip AP", thicknessCm: 23, maxEsdMgy: 10 },
	{ slug: "chest-pa", label: "Chest PA", thicknessCm: 23, maxEsdMgy: 0.4 },
	{ slug: "chest-lat", label: "Chest LAT", thicknessCm: 32, maxEsdMgy: 1.4 },
	{
		slug: "thoracic-ap",
		label: "Thoracic spine AP",
		thicknessCm: 23,
		maxEsdMgy: 7,
	},
	{
		slug: "thoracic-lat",
		label: "Thoracic spine LAT",
		thicknessCm: 32,
		maxEsdMgy: 20,
	},
	{ slug: "skull-ap", label: "Skull AP", thicknessCm: 19, maxEsdMgy: 5 },
	{ slug: "skull-lat", label: "Skull LAT", thicknessCm: 15, maxEsdMgy: 3 },
];
