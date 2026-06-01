const mongoose = require('mongoose');
const Paper = require('../models/Paper');
const { ErrorResponse } = require('../middleware/error');

let memoryPapers = [
  {
    _id: "6650a1b2c3d4e5f678901234",
    title: "Quantum Error Correction in Topologically Ordered Systems",
    abstract: "We present a fault-tolerant quantum error correction scheme using surface codes on 2D lattice geometries. Our approach achieves threshold error rates under realistic decoherence noise.",
    authors: ["Dr. Elena Rostova", "Prof. Alexander Vance"],
    doi: "10.1038/s41586-026-04821-x",
    pdfUrl: "https://arxiv.org/pdf/2401.00001.pdf",
    citations: 142,
    tags: ["Quantum Computing", "Physics", "Error Correction"],
    uploadedBy: { _id: "u1", name: "Dr. Elena Rostova", role: "researcher" },
    createdAt: new Date("2026-05-14").toISOString()
  },
  {
    _id: "6650a1b2c3d4e5f678901235",
    title: "Transformer-Based Multimodal Reasoning in Academic Publishing",
    abstract: "This study explores automated peer-review assistance using multimodal transformer models to detect methodological flaws and citation anomalies in draft manuscripts.",
    authors: ["Prof. Marcus Vance", "Dr. Sophia Chen"],
    doi: "10.1145/3618257.3624801",
    pdfUrl: "https://arxiv.org/pdf/2401.00002.pdf",
    citations: 89,
    tags: ["Machine Learning", "NLP", "Academic AI"],
    uploadedBy: { _id: "u2", name: "Prof. Marcus Vance", role: "professor" },
    createdAt: new Date("2026-05-20").toISOString()
  },
  {
    _id: "6650a1b2c3d4e5f678901236",
    title: "CRISPR-Cas13 Precision RNA Editing for Rare Genetic Disorders",
    abstract: "We demonstrate target-specific transcriptome editing using engineered Cas13 variants without off-target DNA alterations, opening new therapeutic pathways.",
    authors: ["Dr. Sarah Lin", "Dr. Robert Thorne"],
    doi: "10.1016/j.cell.2026.04.012",
    pdfUrl: "https://arxiv.org/pdf/2401.00003.pdf",
    citations: 215,
    tags: ["Biotechnology", "Genomics", "CRISPR"],
    uploadedBy: { _id: "u3", name: "Dr. Sarah Lin", role: "researcher" },
    createdAt: new Date("2026-06-02").toISOString()
  },
  {
    _id: "6650a1b2c3d4e5f678901237",
    title: "Decentralized Peer Review Protocols via Zero-Knowledge Proofs",
    abstract: "A novel cryptographically secure protocol for double-blind academic reviews that preserves author anonymity while guaranteeing reviewer credentials verification.",
    authors: ["Alex Rivera", "Dr. Vikram Patel"],
    doi: "10.1109/TIT.2026.981240",
    pdfUrl: "https://arxiv.org/pdf/2401.00004.pdf",
    citations: 64,
    tags: ["Cybersecurity", "Blockchain", "Cryptography"],
    uploadedBy: { _id: "u4", name: "Alex Rivera", role: "researcher" },
    createdAt: new Date("2026-06-10").toISOString()
  },
  {
    _id: "6650a1b2c3d4e5f678901238",
    title: "Atmospheric Carbon Capture Optimization using Metal-Organic Frameworks",
    abstract: "High-throughput computational screening of 50,000 MOF structures to identify optimal pore geometries for selective CO2 adsorption at ambient temperatures.",
    authors: ["Dr. David O'Connor", "Prof. Mei-Ling Huang"],
    doi: "10.1021/acscatal.6b01234",
    pdfUrl: "https://arxiv.org/pdf/2401.00005.pdf",
    citations: 178,
    tags: ["Renewable Energy", "Chemistry", "Sustainability"],
    uploadedBy: { _id: "u5", name: "Dr. David O'Connor", role: "professor" },
    createdAt: new Date("2026-06-18").toISOString()
  },
  {
    _id: "6650a1b2c3d4e5f678901239",
    title: "Neural Architecture Search for Ultra-Low Power Edge Computing",
    abstract: "An automated hardware-aware NAS framework designed for real-time sensor processing on sub-milliwatt microcontrollers with minimal accuracy degradation.",
    authors: ["Prof. Priya Sharma", "Kaito Tanaka"],
    doi: "10.1109/TPAMI.2026.314902",
    pdfUrl: "https://arxiv.org/pdf/2401.00006.pdf",
    citations: 92,
    tags: ["Edge AI", "Computer Vision", "Embedded Systems"],
    uploadedBy: { _id: "u6", name: "Prof. Priya Sharma", role: "professor" },
    createdAt: new Date("2026-06-25").toISOString()
  }
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all papers
// @route   GET /api/papers
// @access  Public
exports.getPapers = async (req, res, next) => {
  try {
    let papers = [];
    if (isDbConnected()) {
      try {
        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        let query = Paper.find(JSON.parse(queryStr)).populate({
          path: 'uploadedBy',
          select: 'name role'
        });

        if (req.query.search) {
          const searchPattern = new RegExp(req.query.search, 'i');
          query = query.find({
            $or: [
              { title: searchPattern },
              { abstract: searchPattern },
              { authors: searchPattern }
            ]
          });
        }

        if (req.query.select) {
          const fields = req.query.select.split(',').join(' ');
          query = query.select(fields);
        }

        if (req.query.sort) {
          const sortBy = req.query.sort.split(',').join(' ');
          query = query.sort(sortBy);
        } else {
          query = query.sort('-createdAt');
        }

        papers = await query;
      } catch (dbErr) {
        papers = memoryPapers;
      }
    } else {
      papers = memoryPapers;
    }

    if (!papers || papers.length === 0) {
      papers = memoryPapers;
    }

    if (req.query.search && papers === memoryPapers) {
      const s = req.query.search.toLowerCase();
      papers = papers.filter(p =>
        p.title.toLowerCase().includes(s) ||
        p.abstract.toLowerCase().includes(s) ||
        p.authors.some(a => a.toLowerCase().includes(s)) ||
        p.tags.some(t => t.toLowerCase().includes(s))
      );
    }

    res.status(200).json({
      success: true,
      count: papers.length,
      data: papers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single paper
// @route   GET /api/papers/:id
// @access  Public
exports.getPaper = async (req, res, next) => {
  try {
    let paper = null;
    if (isDbConnected()) {
      try {
        paper = await Paper.findById(req.params.id).populate({
          path: 'uploadedBy',
          select: 'name role'
        });
      } catch (e) {
        paper = memoryPapers.find(p => p._id === req.params.id);
      }
    } else {
      paper = memoryPapers.find(p => p._id === req.params.id);
    }

    if (!paper) {
      paper = memoryPapers.find(p => p._id === req.params.id);
    }

    if (!paper) {
      return next(new ErrorResponse(`Paper not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: paper
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new paper
// @route   POST /api/papers
// @access  Private
exports.createPaper = async (req, res, next) => {
  try {
    req.body.uploadedBy = req.user ? req.user.id : "u1";
    let paper;
    if (isDbConnected()) {
      try {
        paper = await Paper.create(req.body);
      } catch (dbErr) {
        paper = {
          _id: 'paper_' + Date.now(),
          ...req.body,
          authors: Array.isArray(req.body.authors) ? req.body.authors : [req.body.authors || "Author"],
          tags: Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags || "Research"],
          citations: Number(req.body.citations) || 0,
          createdAt: new Date().toISOString(),
          uploadedBy: { _id: req.user ? req.user.id : "u1", name: req.user ? req.user.name : "Researcher", role: req.user ? req.user.role : "researcher" }
        };
        memoryPapers.unshift(paper);
      }
    } else {
      paper = {
        _id: 'paper_' + Date.now(),
        ...req.body,
        authors: Array.isArray(req.body.authors) ? req.body.authors : [req.body.authors || "Author"],
        tags: Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags || "Research"],
        citations: Number(req.body.citations) || 0,
        createdAt: new Date().toISOString(),
        uploadedBy: { _id: req.user ? req.user.id : "u1", name: req.user ? req.user.name : "Researcher", role: req.user ? req.user.role : "researcher" }
      };
      memoryPapers.unshift(paper);
    }

    res.status(201).json({
      success: true,
      data: paper
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete paper
// @route   DELETE /api/papers/:id
// @access  Private
exports.deletePaper = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const paper = await Paper.findById(req.params.id);
        if (paper) {
          if (paper.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this paper`, 401));
          }
          await Paper.findByIdAndDelete(req.params.id);
        }
      } catch (dbErr) {
        memoryPapers = memoryPapers.filter(p => p._id !== req.params.id);
      }
    } else {
      memoryPapers = memoryPapers.filter(p => p._id !== req.params.id);
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
