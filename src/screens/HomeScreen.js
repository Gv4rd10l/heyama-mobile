import { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, RefreshControl, Image } from 'react-native';
import { getEvents, socket } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();

    socket.on('eventCreated', (newEvent) => {
      setEvents((prev) => [newEvent, ...prev]);
    });

    socket.on('eventDeleted', (deletedId) => {
      setEvents((prev) => prev.filter((event) => event._id !== deletedId));
    });

    return () => {
      socket.off('eventCreated');
      socket.off('eventDeleted');
    };
  }, []);

  const loadEvents = async () => {
    setRefreshing(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const EventPost = ({ event }) => (
    <TouchableOpacity 
      style={styles.post}
      onPress={() => navigation.navigate('EventDetail', { id: event._id })}
      activeOpacity={0.95}
    >
      {/* Header du post */}
      <View style={styles.postHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🎉</Text>
          </View>
          <View>
            <Text style={styles.username}>{event.title}</Text>
            <Text style={styles.timestamp}>
              {new Date(event.createdAt).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short' 
              })} · {new Date(event.createdAt).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <Text style={styles.description}>{event.description}</Text>

      {/* Image */}
      <Image 
        source={{ uri: event.imageUrl }} 
        style={styles.postImage}
        resizeMode="cover"
      />

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>❤️</Text>
          <Text style={styles.actionText}>J'aime</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Commenter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionText}>Partager</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <EventPost event={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadEvents} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Aucun événement</Text>
            <Text style={styles.emptySubtext}>Soyez le premier à publier !</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateEvent')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  list: {
    paddingBottom: 80,
  },
  post: {
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    paddingTop: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  username: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  timestamp: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  moreIcon: {
    color: '#888',
    fontSize: 20,
  },
  description: {
    color: '#e0e0e0',
    fontSize: 15,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionText: {
    color: '#888',
    fontSize: 14,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#444',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});