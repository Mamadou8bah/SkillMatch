package SkillMatch.service;

import SkillMatch.exception.ResourceNotFoundException;
import SkillMatch.model.Connection;
import SkillMatch.model.User;
import SkillMatch.repository.ConnectionRepository;
import SkillMatch.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ConnectionService {
    private final ConnectionRepository connectionRepository;
    private final UserRepo userRepository;

    public void sendConnectionRequest(User requester, Long targetId) {
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<Connection> existing = connectionRepository.findConnectionBetween(requester, target);
        if (existing.isPresent()) {
            return;
        }

        Connection connection = Connection.builder()
                .requester(requester)
                .target(target)
                .accepted(false)
                .build();
        connectionRepository.save(connection);
    }

    public void acceptConnectionRequest(User target, Long requestId) {
        Connection connection = connectionRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Connection request not found"));

        if (!connection.getTarget().getId().equals(target.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        connection.setAccepted(true);
        connectionRepository.save(connection);
    }

    public List<User> getConnections(User user) {
        List<Connection> asRequester = connectionRepository.findByRequesterAndAccepted(user, true);
        List<Connection> asTarget = connectionRepository.findByTargetAndAccepted(user, true);

        return Stream.concat(
                asRequester.stream().map(Connection::getTarget),
                asTarget.stream().map(Connection::getRequester)
        ).collect(Collectors.toList());
    }

    public List<Connection> getPendingRequests(User user) {
        return connectionRepository.findByTargetAndAcceptedFalse(user);
    }

    public boolean areConnected(User u1, User u2) {
        return connectionRepository.findConnectionBetween(u1, u2)
                .map(Connection::isAccepted)
                .orElse(false);
    }
}
