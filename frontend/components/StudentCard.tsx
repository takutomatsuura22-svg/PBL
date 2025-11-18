import Link from 'next/link'

interface StudentCardProps {
  id: string
  name: string
  motivation: number
  load: number
}

export default function StudentCard({ id, name, motivation, load }: StudentCardProps) {
  return (
    <Link href={`/student/${id}`}>
      <div className="border p-4 rounded hover:shadow-lg transition-shadow">
        <h3 className="font-semibold text-lg mb-2">{name}</h3>
        <div className="space-y-2">
          <div>
            <span className="text-sm text-gray-600">モチベーション: </span>
            <span className="font-semibold">{motivation}/10</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">タスク量: </span>
            <span className="font-semibold">{load}/10</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

