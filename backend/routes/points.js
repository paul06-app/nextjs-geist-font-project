const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

// Validation pour ajouter/retirer des points
const pointsValidation = [
  body('personId')
    .notEmpty()
    .withMessage('L\'ID de la personne est requis'),
  body('points')
    .isInt({ min: -200, max: 200 })
    .withMessage('Les points doivent être un nombre entier entre -200 et 200'),
  body('comment')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Le commentaire doit contenir entre 1 et 500 caractères')
];

// POST /api/points - Ajouter ou retirer des points
router.post('/', pointsValidation, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const { personId, points, comment } = req.body;

    // Utiliser une transaction pour assurer la cohérence des données
    const result = await prisma.$transaction(async (prisma) => {
      // Vérifier si la personne existe
      const person = await prisma.person.findUnique({
        where: { id: personId }
      });

      if (!person) {
        throw new Error('Personne non trouvée');
      }

      // Calculer le nouveau score
      const newScore = person.score + points;

      // Vérifier que le nouveau score ne dépasse pas les limites
      if (newScore < 0) {
        throw new Error('Le score ne peut pas être négatif');
      }

      if (newScore > person.maxScore) {
        throw new Error(`Le score ne peut pas dépasser ${person.maxScore} points`);
      }

      // Mettre à jour le score de la personne
      const updatedPerson = await prisma.person.update({
        where: { id: personId },
        data: { score: newScore }
      });

      // Créer l'entrée dans l'historique
      const pointHistory = await prisma.pointHistory.create({
        data: {
          personId,
          userId: req.user.id,
          points,
          comment
        },
        include: {
          modifiedBy: {
            select: {
              id: true,
              email: true
            }
          },
          person: {
            select: {
              id: true,
              name: true,
              score: true
            }
          }
        }
      });

      return { updatedPerson, pointHistory };
    });

    res.status(201).json({
      message: points > 0 ? 'Points ajoutés avec succès' : 'Points retirés avec succès',
      person: result.updatedPerson,
      pointHistory: result.pointHistory
    });

  } catch (error) {
    console.error('Erreur lors de la modification des points:', error);
    
    if (error.message === 'Personne non trouvée') {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message.includes('score') || error.message.includes('points')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: 'Erreur lors de la modification des points'
    });
  }
});

// GET /api/points/history/:personId - Récupérer l'historique des points d'une personne
router.get('/history/:personId', async (req, res) => {
  try {
    const { personId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Vérifier si la personne existe
    const person = await prisma.person.findUnique({
      where: { id: personId },
      select: {
        id: true,
        name: true,
        score: true,
        maxScore: true
      }
    });

    if (!person) {
      return res.status(404).json({
        message: 'Personne non trouvée'
      });
    }

    // Récupérer l'historique avec pagination
    const [pointHistories, totalCount] = await Promise.all([
      prisma.pointHistory.findMany({
        where: { personId },
        include: {
          modifiedBy: {
            select: {
              id: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.pointHistory.count({
        where: { personId }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      message: 'Historique récupéré avec succès',
      person,
      history: pointHistories,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
});

// GET /api/points/stats/:personId - Récupérer les statistiques d'une personne
router.get('/stats/:personId', async (req, res) => {
  try {
    const { personId } = req.params;

    // Vérifier si la personne existe
    const person = await prisma.person.findUnique({
      where: { id: personId }
    });

    if (!person) {
      return res.status(404).json({
        message: 'Personne non trouvée'
      });
    }

    // Calculer les statistiques
    const stats = await prisma.pointHistory.aggregate({
      where: { personId },
      _sum: {
        points: true
      },
      _count: {
        points: true
      }
    });

    const positivePoints = await prisma.pointHistory.aggregate({
      where: { 
        personId,
        points: { gt: 0 }
      },
      _sum: {
        points: true
      },
      _count: {
        points: true
      }
    });

    const negativePoints = await prisma.pointHistory.aggregate({
      where: { 
        personId,
        points: { lt: 0 }
      },
      _sum: {
        points: true
      },
      _count: {
        points: true
      }
    });

    res.json({
      message: 'Statistiques récupérées avec succès',
      person: {
        id: person.id,
        name: person.name,
        currentScore: person.score,
        maxScore: person.maxScore
      },
      stats: {
        totalModifications: stats._count.points || 0,
        totalPointsChanged: stats._sum.points || 0,
        pointsAdded: {
          total: positivePoints._sum.points || 0,
          count: positivePoints._count.points || 0
        },
        pointsRemoved: {
          total: Math.abs(negativePoints._sum.points || 0),
          count: negativePoints._count.points || 0
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// DELETE /api/points/:historyId - Supprimer une entrée de l'historique (admin seulement)
router.delete('/:historyId', async (req, res) => {
  try {
    const { historyId } = req.params;

    // Utiliser une transaction pour maintenir la cohérence
    const result = await prisma.$transaction(async (prisma) => {
      // Récupérer l'entrée de l'historique
      const pointHistory = await prisma.pointHistory.findUnique({
        where: { id: historyId },
        include: {
          person: true
        }
      });

      if (!pointHistory) {
        throw new Error('Entrée d\'historique non trouvée');
      }

      // Calculer le nouveau score en annulant la modification
      const newScore = pointHistory.person.score - pointHistory.points;

      // Vérifier que le nouveau score est valide
      if (newScore < 0 || newScore > pointHistory.person.maxScore) {
        throw new Error('Impossible d\'annuler cette modification : score invalide');
      }

      // Mettre à jour le score de la personne
      await prisma.person.update({
        where: { id: pointHistory.personId },
        data: { score: newScore }
      });

      // Supprimer l'entrée de l'historique
      await prisma.pointHistory.delete({
        where: { id: historyId }
      });

      return { pointHistory, newScore };
    });

    res.json({
      message: 'Modification annulée avec succès',
      cancelledEntry: result.pointHistory,
      newScore: result.newScore
    });

  } catch (error) {
    console.error('Erreur lors de l\'annulation de la modification:', error);
    
    if (error.message.includes('non trouvée') || error.message.includes('invalide')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: 'Erreur lors de l\'annulation de la modification'
    });
  }
});

module.exports = router;
