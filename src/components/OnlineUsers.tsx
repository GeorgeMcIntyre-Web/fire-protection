import { useRealtimePresence } from '../hooks/useRealtimePresence'

interface OnlineUsersProps {
  channelName?: string
  maxDisplay?: number
}

export default function OnlineUsers({ channelName = 'global', maxDisplay = 5 }: OnlineUsersProps) {
  const { onlineUsers, isConnected } = useRealtimePresence(channelName)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'busy':
        return 'bg-red-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!isConnected || onlineUsers.length === 0) {
    return null
  }

  const displayUsers = onlineUsers.slice(0, maxDisplay)
  const remainingCount = onlineUsers.length - maxDisplay

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center -space-x-2">
        {displayUsers.map((user) => (
          <div
            key={user.user_id}
            className="relative group"
            title={`${user.user_name} - ${user.status}`}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm">
                {getInitials(user.user_name)}
              </div>

              {/* Status Indicator */}
              <div
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${getStatusColor(
                  user.status
                )}`}
              ></div>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
              <div className="font-medium">{user.user_name}</div>
              <div className="text-gray-300 capitalize">{user.status}</div>
              {user.current_page && (
                <div className="text-gray-400 text-xs mt-1">
                  Viewing: {user.current_page}
                </div>
              )}
              {/* Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        ))}

        {/* Remaining count */}
        {remainingCount > 0 && (
          <div
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white shadow-sm"
            title={`${remainingCount} more user${remainingCount > 1 ? 's' : ''} online`}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Online count text */}
      <span className="text-sm text-gray-600">
        {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'} online
      </span>
    </div>
  )
}
