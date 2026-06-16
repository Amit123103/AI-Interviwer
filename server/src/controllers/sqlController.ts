import { Request, Response } from 'express'
import pool from '../lib/db'
import prisma from '../prisma'
import { logStudentActivity } from '../services/activityService'

export const executeRawSQL = async (req: Request, res: Response) => {
    const { query } = req.body
    const user = (req as any).user

    if (!query) return res.status(400).json({ message: 'Query required' })

    try {
        const start = Date.now()
        const result = await pool.query(query)
        const duration = Date.now() - start

        // Centralized Student Activity Log
        await logStudentActivity(
            user.id,
            'SQL_PRACTICE',
            'Executed Raw SQL Query',
            `Rows: ${result.rowCount}, Duration: ${duration}ms`,
            { query: query.substring(0, 500), rowCount: result.rowCount }
        ).catch(() => {});

        // Log this high-authority action via Prisma (Original Admin Log)
        await prisma.adminLog.create({
            data: {
                adminId: user.id,
                adminName: user.username,
                action: 'DIRECT_SQL_EXECUTION',
                targetName: 'DATABASE',
                details: { query, rowCount: result.rowCount, duration },
                ipAddress: req.ip || 'unknown'
            }
        })

        res.json({
            status: 'success',
            data: result.rows,
            rowCount: result.rowCount,
            fields: result.fields.map((f: any) => f.name),
            duration
        })
    } catch (err: any) {
        res.status(400).json({
            status: 'error',
            message: err.message,
            code: err.code,
            hint: err.hint
        })
    }
}

export const getDatabaseStats = async (req: Request, res: Response) => {
    try {
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `)

        const tables = tablesResult.rows.map(r => r.table_name)

        // Get counts for each table
        const stats = await Promise.all(tables.map(async table => {
            const countRes = await pool.query(`SELECT COUNT(*) FROM "${table}"`)
            return { name: table, count: parseInt(countRes.rows[0].count) }
        }))

        res.json({ tables: stats })
    } catch (err: any) {
        res.status(500).json({ message: err.message })
    }
}

export const getTableData = async (req: Request, res: Response) => {
    const { tableName } = req.params
    const { limit = 100, offset = 0 } = req.query

    try {
        const result = await pool.query(`SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`, [limit, offset])
        const schemaResult = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = $1
        `, [tableName])

        res.json({
            data: result.rows,
            schema: schemaResult.rows,
            total: result.rowCount
        })
    } catch (err: any) {
        res.status(400).json({ message: err.message })
    }
}
