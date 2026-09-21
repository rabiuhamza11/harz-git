// InteropDriver — proves the JS mesh-frame twin speaks the EXACT frozen Kotlin
// G1/G2 v2.1 wire format (MeshFrame.kt, commit 12b5991, unchanged).
// Kotlin value-class EdgeId + synthetic constructors are hidden from Java source,
// so the encode path uses reflection into the same frozen classes.
import com.harz.edgetelecom.mesh.*;
import java.lang.reflect.Constructor;
import java.nio.file.*;
import java.util.*;

public class InteropDriver {
  public static void main(String[] args) throws Exception {
    String mode = args[0];
    if (mode.equals("encode")) {
      byte[] payload = Base64.getDecoder().decode(args[1]);
      Constructor<?> ctor = null;
      for (Constructor<?> c : MeshFrame.class.getDeclaredConstructors()) {
        if (c.getParameterCount() == 9) ctor = c;
      }
      ctor.setAccessible(true);
      MeshFrame f = (MeshFrame) ctor.newInstance(MeshProtocol.TYPE_DATA, "AAAA", "CCCC",
        42L, 8, 0, Collections.<EdgeId>emptyList(), new byte[0], payload);
      byte[] enc = f.encode();
      Files.write(Path.of(args[2]), enc);
      System.out.println("KOTLIN_ENCODED " + enc.length + " bytes (DATA src=AAAA dst=CCCC seq=42 ttl=8 hops=0 route=[])");
    } else if (mode.equals("decode")) {
      byte[] raw = Files.readAllBytes(Path.of(args[1]));
      MeshFrame f = MeshFrame.Companion.decode(raw);
      System.out.println("KOTLIN_DECODE_OK type=" + f.component1()
        + " seq=" + f.getSeq() + " ttl=" + f.getTtl() + " hops=" + f.getHops()
        + " route=" + f.getRoute() + " payLen=" + f.getPayload().length);
      Files.write(Path.of(args[2]), f.getPayload());
    }
  }
}
