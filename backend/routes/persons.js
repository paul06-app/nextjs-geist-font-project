const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Appliquer l'authentification à toutes les routes
router.use(authenticateToken);

// Validation pour créer une personne
const createPersonValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le nom doit contenir entre 1 et 100 caractères')
];

// GET /api/persons - Récupérer toutes les personnes
router.get('/', async (req, res) => {
  try {
    const persons = await prisma.person.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            email: true
          }
        },
        _count: {
          select: {
            pointHistories: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      message: 'Personnes récupérées avec succès',
      persons
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des personnes:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des personnes'
    });
  }
});

// GET /api/persons/:id - Récupérer une personne spécifique
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true
          }
        },
        pointHistories: {
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
          }
        }
      }
    });

    if (!person) {
      return res.status(404).json({
        message: 'Personne non trouvée'
      });
    }

    res.json({
      message: 'Personne récupérée avec succès',
      person
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la personne:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération de la personne'
    });
  }
});

// POST /api/persons - Créer une nouvelle personne
router.post('/', createPersonValidation, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const { name } = req.body;

    // Vérifier si une personne avec ce nom existe déjà
    const existingPerson = await prisma.person.findFirst({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingPerson) {
      return res.status(400).json({
        message: 'Une personne avec ce nom existe déjà'
      });
    }

    const person = await prisma.person.create({
      data: {
        name,
        createdById: req.user.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Personne créée avec succès',
      person
    });

  } catch (error) {
    console.error('Erreur lors de la création de la personne:', error);
    res.status(500).json({
      message: 'Erreur lors de la création de la personne'
    });
  }
});

// PUT /api/persons/:id - Modifier une personne
router.put('/:id', createPersonValidation, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name } = req.body;

    // Vérifier si la personne existe
    const existingPerson = await prisma.person.findUnique({
      where: { id }
    });

    if (!existingPerson) {
      return res.status(404).json({
        message: 'Personne non trouvée'
      });
    }

    // Vérifier si une autre personne avec ce nom existe déjà
    const duplicatePerson = await prisma.person.findFirst({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive'
        },
        id: {
          not: id
        }
      }
    });

    if (duplicatePerson) {
      return res.status(400).json({
        message: 'Une personne avec ce nom existe déjà'
      });
    }

    const updatedPerson = await prisma.person.update({
      where: { id },
      data: { name },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Personne modifiée avec succès',
      person: updatedPerson
    });

  } catch (error) {
    console.error('Erreur lors de la modification de la personne:', error);
    res.status(500).json({
      message: 'Erreur lors de la modification de la personne'
    });
  }
});

// DELETE /api/persons/:id - Supprimer une personne
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la personne existe
    const existingPerson = await prisma.person.findUnique({
      where: { id }
    });

    if (!existingPerson) {
      return res.status(404).json({
        message: 'Personne non trouvée'
      });
    }

    // Supprimer la personne (les historiques de points seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.person.delete({
      where: { id }
    });

    res.json({
      message: 'Personne supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la personne:', error);
    res.status(500).json({
      message: 'Erreur lors de la suppression de la personne'
    });
  }
});

module.exports = router;
