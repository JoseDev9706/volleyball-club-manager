
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import type { Player, Team, Attendance, ClubSettings, PlayerCreationData } from './types';
import { Prisma } from '@prisma/client';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// --- ENUM MAPPINGS ---
// To handle discrepancies between frontend display values and Prisma enum keys.

const subCategoryToPrisma: { [key: string]: 'Basico' | 'Intermedio' | 'Avanzado' } = {
    'Básico': 'Basico',
    'Intermedio': 'Intermedio',
    'Avanzado': 'Avanzado',
};
const subCategoryFromPrisma: { [key: string]: string } = {
    'Basico': 'Básico',
    'Intermedio': 'Intermedio',
    'Avanzado': 'Avanzado',
};

const positionToPrisma: { [key: string]: 'Setter' | 'Libero' | 'MiddleBlocker' | 'OutsideHitter' | 'OppositeHitter' } = {
    'Colocador': 'Setter',
    'Líbero': 'Libero',
    'Central': 'MiddleBlocker',
    'Punta Receptor': 'OutsideHitter',
    'Opuesto': 'OppositeHitter',
};
const positionFromPrisma: { [key: string]: string } = {
    'Setter': 'Colocador',
    'Libero': 'Líbero',
    'MiddleBlocker': 'Central',
    'OutsideHitter': 'Punta Receptor',
    'OppositeHitter': 'Opuesto',
};
// MainCategory enum values match Prisma keys, so no mapping is needed.

// --- HELPER FUNCTIONS FOR DATA MAPPING ---

const mapPlayerForFrontend = (player: any): Player => {
    if (!player) return player;
    const { birthDate, joinDate, lastPaymentDate, statsHistory, ...rest } = player;
    return {
        ...rest,
        birthDate: birthDate.toISOString().split('T')[0],
        joinDate: joinDate.toISOString(),
        lastPaymentDate: lastPaymentDate ? lastPaymentDate.toISOString() : undefined,
        statsHistory: statsHistory.map((sh: any) => ({ ...sh, stats: sh.stats as any, date: sh.date.toISOString() })),
        subCategory: subCategoryFromPrisma[player.subCategory] || player.subCategory,
        position: positionFromPrisma[player.position] || player.position,
    };
};

const mapTeamForFrontend = (team: any) => {
    if (!team) return team;
    const { players, ...teamData } = team;
    return {
        ...teamData,
        playerIds: players.map((p: { id: string }) => p.id),
        subCategory: subCategoryFromPrisma[teamData.subCategory] || teamData.subCategory,
    };
};


// Root endpoint
app.get('/api', (req: Request, res: Response) => {
    res.send('Volleyball Club Manager API is running!');
});

// AUTH
app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { user, pass } = req.body;
    if (user === 'admin' && pass === 'password') {
        return res.json({ success: true, userType: 'admin' });
    }
    if (user === 'superadmin' && pass === 'superpassword') {
        return res.json({ success: true, userType: 'superAdmin' });
    }
    return res.status(401).json({ success: false, userType: null });
});


// PLAYERS
app.get('/api/players', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const players = await prisma.player.findMany({
            include: { statsHistory: { orderBy: { date: 'desc' } } },
            orderBy: { joinDate: 'desc' },
        });
        res.json(players.map(mapPlayerForFrontend));
    } catch (error) {
        next(error);
    }
});

app.get('/api/players/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const player = await prisma.player.findUnique({
            where: { id: req.params.id },
            include: { statsHistory: { orderBy: { date: 'desc' } } },
        });
        if (player) {
            res.json(mapPlayerForFrontend(player));
        } else {
            res.status(404).json({ error: 'Player not found' });
        }
    } catch (error) {
        next(error);
    }
});

app.post('/api/players', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { statsHistory, ...playerData } = req.body as PlayerCreationData;

        const mappedSubCategory = subCategoryToPrisma[playerData.subCategory];
        const mappedPosition = positionToPrisma[playerData.position];

        if (!mappedSubCategory || !mappedPosition) {
            return res.status(400).json({ message: 'Invalid subCategory or position value provided.' });
        }

        const newPlayer = await prisma.player.create({
            data: {
                ...playerData,
                birthDate: new Date(playerData.birthDate),
                mainCategories: playerData.mainCategories as any, // Values match keys
                subCategory: mappedSubCategory,
                position: mappedPosition,
                statsHistory: {
                    create: statsHistory.map(sh => ({ stats: sh.stats as any, date: new Date(sh.date) }))
                }
            },
            include: { statsHistory: { orderBy: { date: 'desc' } } }
        });
        res.status(201).json(mapPlayerForFrontend(newPlayer));
    } catch (error) {
        next(error);
    }
});

app.put('/api/players/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { statsHistory, joinDate, ...playerData } = req.body as Player;

        const mappedSubCategory = subCategoryToPrisma[playerData.subCategory];
        const mappedPosition = positionToPrisma[playerData.position];

        if (!mappedSubCategory || !mappedPosition) {
            return res.status(400).json({ message: 'Invalid subCategory or position value provided.' });
        }

        const dataToUpdate: any = {
            ...playerData,
            id: undefined, // Do not try to update id
            birthDate: new Date(playerData.birthDate),
            lastPaymentDate: playerData.lastPaymentDate ? new Date(playerData.lastPaymentDate) : null,
            mainCategories: playerData.mainCategories as any,
            subCategory: mappedSubCategory,
            position: mappedPosition,
        };

        if (statsHistory && statsHistory.length > 0) {
            const latestStatRecord = statsHistory[0];
            if (latestStatRecord.id) {
                dataToUpdate.statsHistory = {
                    update: {
                        where: { id: latestStatRecord.id },
                        data: { stats: latestStatRecord.stats as any }
                    }
                };
            }
        }

        const updatedPlayer = await prisma.player.update({
            where: { id },
            data: dataToUpdate,
            include: { statsHistory: { orderBy: { date: 'desc' } } }
        });
        res.json(mapPlayerForFrontend(updatedPlayer));
    } catch (error) {
        next(error);
    }
});

app.delete('/api/players/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.player.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

app.get('/api/players/document/:document', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const player = await prisma.player.findUnique({
            where: { document: req.params.document },
            include: { statsHistory: { orderBy: { date: 'desc' } } },
        });
        if (player) {
            res.json(mapPlayerForFrontend(player));
        } else {
            res.status(404).json({ message: 'Jugador no encontrado' });
        }
    } catch (error) {
        next(error);
    }
});

app.post('/api/players/:id/payment', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedPlayer = await prisma.player.update({
            where: { id: req.params.id },
            data: { lastPaymentDate: new Date() },
            include: { statsHistory: { orderBy: { date: 'desc' } } }
        });
        res.json(mapPlayerForFrontend(updatedPlayer));
    } catch (error) {
        next(error);
    }
});


// TEAMS
app.get('/api/teams', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teams = await prisma.team.findMany({
            include: {
                players: {
                    select: { id: true }
                }
            }
        });
        res.json(teams.map(mapTeamForFrontend));
    } catch (error) {
        next(error);
    }
});

app.post('/api/teams', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { playerIds, ...teamData } = req.body as Omit<Team, 'id'>;

        const mappedSubCategory = subCategoryToPrisma[teamData.subCategory];
        if (!mappedSubCategory) {
            return res.status(400).json({ message: 'Invalid subCategory value provided.' });
        }

        const newTeam = await prisma.team.create({
            data: {
                ...teamData,
                mainCategory: teamData.mainCategory as any,
                subCategory: mappedSubCategory,
                players: {
                    connect: playerIds.map(id => ({ id }))
                }
            },
            include: { players: { select: { id: true } } }
        });
        res.status(201).json(mapTeamForFrontend(newTeam));
    } catch (error) {
        next(error);
    }
});

app.put('/api/teams/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { playerIds, mainCategory, subCategory, ...teamData } = req.body as Team;

        // Team category is not meant to be updated, only members and tournament info
        const updatedTeam = await prisma.team.update({
            where: { id },
            data: {
                name: teamData.name,
                tournament: teamData.tournament,
                tournamentPosition: teamData.tournamentPosition,
                players: {
                    set: playerIds.map(pid => ({ id: pid }))
                }
            },
            include: { players: { select: { id: true } } }
        });
        res.json(mapTeamForFrontend(updatedTeam));
    } catch (error) {
        next(error);
    }
});

// TEAMS BY PLAYER
app.get('/api/players/:id/teams', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const teams = await prisma.team.findMany({
            where: {
                players: {
                    some: {
                        id: id
                    }
                }
            },
            include: {
                players: {
                    select: { id: true }
                }
            }
        });
        res.json(teams.map(mapTeamForFrontend));
    } catch (error) {
        next(error);
    }
});

// ATTENDANCE
app.get('/api/attendances', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const attendances = await prisma.attendance.findMany();
        // Format date to YYYY-MM-DD string for frontend compatibility
        const formattedAttendances = attendances.map((a: { date: { toISOString: () => string; }; }) => ({
            ...a,
            date: a.date.toISOString().split('T')[0]
        }));
        res.json(formattedAttendances);
    } catch (error) {
        next(error);
    }
});

app.post('/api/attendances', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { playerId, status } = req.body as Pick<Attendance, 'playerId' | 'status'>;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newRecord = await prisma.attendance.upsert({
            where: {
                playerId_date: {
                    playerId,
                    date: today
                }
            },
            update: { status: status as any },
            create: {
                playerId,
                status: status as any,
                date: today,
            }
        });
        res.status(201).json({ ...newRecord, date: newRecord.date.toISOString().split('T')[0] });
    } catch (error) {
        next(error);
    }
});
// Get attendances for a specific player
app.get('/api/players/:id/attendances', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const attendances = await prisma.attendance.findMany({
            where: { playerId: id },
            orderBy: { date: 'desc' }
        });
        const formattedAttendances = attendances.map(a => ({
            ...a,
            date: a.date.toISOString().split('T')[0]
        }));
        res.json(formattedAttendances);
    } catch (error) {
        next(error);
    }
});


// CLUB SETTINGS
app.get('/api/club-settings', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let settings = await prisma.clubSettings.findUnique({ where: { id: 1 } });
        if (!settings) {
            settings = await prisma.clubSettings.create({
                data: {
                    id: 1,
                    name: "Voley Club",
                    logoUrl: "/logo-default.svg",
                    primaryColor: '#DC2626',
                    secondaryColor: '#F9FAFB',
                    tertiaryColor: '#FBBF24',
                    backgroundColor: '#000000',
                    surfaceColor: '#1F2937',
                    textPrimaryColor: '#F9FAFB',
                    textSecondaryColor: '#9CA3AF',
                    teamCreationEnabled: true,
                    monthlyPaymentEnabled: true,
                }
            });
        }
        const { primaryColor, secondaryColor, tertiaryColor, backgroundColor, surfaceColor, textPrimaryColor, textSecondaryColor, ...rest } = settings;
        const frontendSettings: ClubSettings = {
            ...rest,
            colors: {
                primary: primaryColor,
                secondary: secondaryColor,
                tertiary: tertiaryColor,
                background: backgroundColor,
                surface: surfaceColor,
                textPrimary: textPrimaryColor,
                textSecondary: textSecondaryColor,
            }
        };
        res.json(frontendSettings);
    } catch (error) {
        next(error);
    }
});

app.put('/api/club-settings', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { colors, ...rest } = req.body as ClubSettings;
        const dbSettings = {
            ...rest,
            primaryColor: colors.primary,
            secondaryColor: colors.secondary,
            tertiaryColor: colors.tertiary,
            backgroundColor: colors.background,
            surfaceColor: colors.surface,
            textPrimaryColor: colors.textPrimary,
            textSecondaryColor: colors.textSecondary,
        };

        const updatedSettings = await prisma.clubSettings.update({
            where: { id: 1 },
            data: dbSettings,
        });
        res.json(req.body); // Return in frontend format
    } catch (error) {
        next(error);
    }
});


app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
