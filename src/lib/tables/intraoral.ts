/**
 * Intraoral backscatter factors for dental ESD (entrance skin dose).
 *
 * Source: Tabelas sheet (Modelos_CQ.xltx, K42:L44) — adapted from the IPEN
 * article by Paula Andrade & Maria da Penha, "Elaboração de um procedimento
 * para controle de qualidade em sistemas de radiodiagnóstico odontológico".
 *
 * The factor scales the free-in-air dose at the cone tip up to the
 * tissue-equivalent entrance dose, accounting for backscatter from the
 * patient's skin.
 */
export type Backscatter = {
	/** Focus–film distance the factor is calibrated for (cm). */
	ffdCm: number;
	/** Backscatter factor (dimensionless). */
	factor: number;
};

export const intraoralBackscatter = {
	ffd20: { ffdCm: 20, factor: 1.167 } satisfies Backscatter,
	ffd27_5: { ffdCm: 27.5, factor: 1.208 } satisfies Backscatter,
} as const;

export type IntraoralFfd = keyof typeof intraoralBackscatter;
